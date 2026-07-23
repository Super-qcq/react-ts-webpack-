/**
 * StatPanel — 通用统计卡片行
 * ============================
 * 被 home / posts / comments / albums / todos / photos 等页面复用。
 * 替代每个页面手写一模一样的 Row + Col + Card + Statistic 代码。
 *
 * 用法：
 *   <StatPanel items={[
 *     { value: 100, label: '总数', color: '#1677ff', icon: TeamOutlined },
 *     { value: 5,   label: '当前页', suffix: '条' },
 *   ]} />
 */
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';

/** 单个统计项 */
export interface StatItem {
  value: number | string;
  label: string;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
}

interface StatPanelProps {
  items: StatItem[];
  gutter?: number | [number, number];
}

const StatPanel: React.FC<StatPanelProps> = ({ items, gutter = 16 }) => (
  <Row gutter={[gutter as number, gutter as number]} style={{ marginBottom: 24 }}>
    {items.map((item, i) => {
      const span = Math.floor(24 / items.length);
      return (
        <Col xs={24} sm={12} md={span} key={i}>
          <Card hoverable>
            <Statistic
              title={item.label}
              value={item.value}
              prefix={item.prefix}
              suffix={item.suffix}
              styles={{ content: { color: item.color || '#1677ff', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      );
    })}
  </Row>
);

export default StatPanel;
