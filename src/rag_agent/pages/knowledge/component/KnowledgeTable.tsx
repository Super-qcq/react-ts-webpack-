import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, UploadOutlined, DeleteOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import type { KnowledgeFile } from '../../../types';
import { fetchDocuments, startIndexAll, getIndexStatus, uploadDocument, deleteDocument, reindexDocument } from '../../../api';
import { CFG } from '../../../lib/site.config';
import '../style/index.less';

/**
 * KnowledgeTable — 知识库文件管理
 * 文件列表（格式/大小/索引状态）+ 一键上传并索引 + 全量建索引 + 删除/重建
 */
const KnowledgeTable = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState<string | null>(null); // 正在重建索引的文件名（null=无）
  const uploadingRef = useRef(0); // 并发上传计数（一次选多个也能正确显示"上传中"）

  const load = () => {
    setLoading(true);
    fetchDocuments()
      .then(setFiles)
      .catch((e) => message.error('加载知识库列表失败：' + e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // ===== 全量建索引（异步：启动后台任务 + 轮询状态，切页面不中断）=====
  const handleIndexAll = () => {
    setIndexing(true);
    startIndexAll()
      .then((res) => {
        if (res.status === 'already_running') {
          message.info('索引正在进行中，请稍候');
        } else {
          message.success('全量索引已开始，后台执行中...');
        }
        const poll = () => {
          getIndexStatus()
            .then((status) => {
              if (!status.running && status.result) {
                message.success(`索引完成：入库 ${status.result.inserted_chunks} 块`);
                if (status.result.failed.length) {
                  message.warning('部分文件失败：' + status.result.failed.join('; '));
                }
                load();
                setIndexing(false);
              } else if (status.running) {
                setTimeout(poll, CFG.indexPollMs);
              } else {
                setIndexing(false);
              }
            })
            .catch(() => {
              setIndexing(false);
            });
        };
        setTimeout(poll, CFG.indexPollMs);
      })
      .catch((e) => {
        message.error('启动索引失败：' + e.message);
        setIndexing(false);
      });
  };

  // ===== 一键上传并索引：点「上传并索引」→ 选文件 → 立即保存到 data/knowledge 并向量化入库 =====
  const doUploadFile = async (file: File) => {
    uploadingRef.current += 1;
    setUploading(true);
    try {
      const res = await uploadDocument(file);
      if (res.failed.length) message.warning(`${file.name} 部分失败：${res.failed[0]}`);
      else message.success(`${file.name} 已上传并索引`);
    } catch (e) {
      message.error(`上传失败：${file.name} ${(e as Error).message}`);
    } finally {
      uploadingRef.current -= 1;
      if (uploadingRef.current <= 0) setUploading(false);
      load(); // 刷新列表（新文件显示"已入库"）
    }
  };

  // ===== 删除 =====
  const handleDelete = (name: string) => {
    deleteDocument(name)
      .then(() => {
        message.success(`已删除 ${name}`);
        load();
      })
      .catch((e) => message.error('删除失败：' + e.message));
  };

  // ===== 单文件重建索引（漏索引 / 本地更新后单独刷新，不动其它文件）=====
  const handleReindex = (name: string) => {
    setReindexing(name);
    reindexDocument(name)
      .then((res) => {
        if (res.failed.length) {
          message.error(`${name} 重建失败：${res.failed[0]}`);
        } else {
          message.success(`${name} 重建完成，入库 ${res.inserted_chunks} 块`);
        }
        load();
      })
      .catch((e) => {
        const err = e as Error;
        message.error(`${name} 重建失败：${err.message}`);
      })
      .finally(() => setReindexing(null));
  };

  const columns: ColumnsType<KnowledgeFile> = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1677ff' }} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '格式',
      key: 'ext',
      width: 90,
      align: 'center',
      render: (_, r) => <Tag color="geekblue">{r.name.split('.').pop()?.toUpperCase()}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: '索引状态',
      dataIndex: 'indexed',
      key: 'indexed',
      width: 120,
      align: 'center',
      render: (v: boolean) =>
        v ? <Tag color="green">已入库</Tag> : <Tag color="default">未索引</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<ToolOutlined />}
            loading={reindexing === r.name}
            disabled={reindexing !== null}
            onClick={() => handleReindex(r.name)}
          >
            重建索引
          </Button>
          <Popconfirm title={`确认删除 ${r.name}？`} onConfirm={() => handleDelete(r.name)}>
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="kb-card">
      {/* 一键上传：一条清爽的上传条 */}
      <div className="kb-upload">
        <div className="kb-upload-info">
          <span className="kb-upload-ic">
            <UploadOutlined />
          </span>
          <div>
            <div className="kb-upload-title">上传并索引</div>
            <div className="kb-upload-sub">
              选完文件即自动保存到 data/knowledge，并完成 切割 → 向量化 → 入库
            </div>
            <div className="kb-upload-fmts">
              支持 PDF / Word(.doc/.docx) / Markdown(.md) / TXT / CSV / JSON(.json/.jsonl) / HTML(.html)
            </div>
          </div>
        </div>
        <div className="kb-upload-right">
          <Upload
            multiple
            showUploadList={false}
            accept=".pdf,.doc,.docx,.md,.markdown,.txt,.csv,.json,.jsonl,.html,.htm"
            customRequest={({ file, onSuccess, onError }) => {
              doUploadFile(file as File)
                .then(() => onSuccess?.({}))
                .catch((err: unknown) => onError?.(err as Error));
            }}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
              上传并索引
            </Button>
          </Upload>
          {uploading && <div className="kb-upload-status">正在上传并索引… 请稍候</div>}
        </div>
      </div>

      <div className="kb-toolbar">
        <Space>
          <Button icon={<ReloadOutlined />} loading={indexing} onClick={handleIndexAll}>
            全量建索引
          </Button>
          <Button icon={<ReloadOutlined />} onClick={load}>
            刷新
          </Button>
        </Space>
        <Tag color="default">{files.length} 个文件</Tag>
      </div>

      <Table<KnowledgeFile>
        rowKey="name"
        columns={columns}
        dataSource={files}
        loading={loading}
        pagination={false}
        size="middle"
      />
    </div>
  );
};

export default KnowledgeTable;
