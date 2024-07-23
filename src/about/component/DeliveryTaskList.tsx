import * as React from 'react'
import '../css/task.less'
import { Button, Divider, List, Modal } from 'antd'
import axios from 'axios';
import { Link, Route, Routes } from 'react-router-dom';
import { AboutDeliveryTaskList } from './aboutDeliveryTaskList';

import { ScrollInfoTable } from './ScrollInfoTable';
import * as $ from 'jquery';
import { UpdateInfo } from './UpdateInfo';

interface DeliveryTaskListProps { }
interface DeliveryTaskListStates {
    isModal: boolean
    data: '',
    updateInfoData: string,
    scrollInfo: { id: string, name: string }[]
    selectListId: string
}

/**
 * 上传任务列表
 *
 * @author
 */
export class DeliveryTaskList extends React.Component<
    DeliveryTaskListProps,
    DeliveryTaskListStates
> {
    scrollTopContainer: any;
    scrollPanel: HTMLDivElement;
    constructor(props: DeliveryTaskListProps) {
        super(props)
        this.state = {
            isModal: false,
            data: '',
            updateInfoData: '',
            scrollInfo: [],
            selectListId: ''
        }
    }

    private isModalOpen = (isModal: boolean) => {
        let i = 1
        let arr = []
        arr.forEach(element => { })
        while (i < 10) {
            i++
        }

        this.setState({
            isModal,
        })
    }

    /**
     * 发送请求
     */
    private getData() {
        //配置baseURL
        axios({
            method: 'get',
            url: '/dev/api/product/getBaseCategoryList',
        }).then(value => {
            if (value && value.data && value.data.data && value.data.data.length > 0) {
                this.setState({
                    data: value.data.data[0].categoryName
                });
            } else {
                console.error('返回的数据格式不正确或数据为空');
                // 可以设置一个错误状态或默认值  
            }
        }).catch(error => {
            console.error('请求失败:', error);
        });

    }

    private updateInfo = (data: string) => {
        this.setState({
            updateInfoData: data
        })
    }

    /**
     * 设置滚动的区域
     * @param container 
     */
    private handleOnScroll = (container) => {
        this.scrollTopContainer = container
    }

    /**
     * 设置左边点击选中的id
     * @param selectId 
     */
    private onSelectListItem = (selectId: string) => {
        this.setState({
            selectListId: selectId
        })
    }

    componentDidMount(): void {
        const newScrollInfo = [
            { id: "01", name: '01' },
            { id: "02", name: '02' },
            { id: "03", name: '03' },
            { id: "04", name: '04' },
            { id: "05", name: '05' },
            { id: "06", name: '06' },
            { id: "07", name: '07' },
        ]
        this.setState({
            scrollInfo: newScrollInfo
        })
    }
    componentDidUpdate(prevProps: Readonly<DeliveryTaskListProps>, prevState: Readonly<DeliveryTaskListStates>, snapshot?: any): void {
        if (!this.state.selectListId) {
            return
        }
        // offsetTop获取的是在整个页面位置中的top值 要滚动区域内容的top值减去整个右边区域所在的位置的top值
        const top: number = this.scrollTopContainer && this.scrollTopContainer.offsetTop - this.scrollPanel.offsetTop;
        if (top) {
            $(this.scrollPanel).animate({scrollTop: top}, 'slow');
        }
    }



    render() {
        const { isModal, data, updateInfoData, scrollInfo, selectListId } = this.state
        return (
            <div className='header'>

                <Routes>
                    <Route path="/about" element={<AboutDeliveryTaskList />}> </Route>
                </Routes>
                <div style={{ color: 'red' }}>-----------------------------------------------------</div>
                {/* 路由跳转到组件 */}
                <Link className="list-group-item" to="/about">About</Link>
                <Button type='primary' onClick={() => this.isModalOpen(true)} >
                    qcq提交eqcq
                </Button>
                <Modal
                    title='Basic Modal'
                    open={isModal}
                    onCancel={() => this.isModalOpen(false)}
                    onOk={() => this.getData()}
                >
                    <p>qqcqqcq</p>
                    <p>{data && data}</p>

                </Modal>
                {/* 子组件给父组件传递数据 */}
                <UpdateInfo updateInfo={data => this.updateInfo(data)} />
                <img src={'../imgs/3Xihnvg6nt.jpg'}></img>
                <div className='img'></div>
                {/* 多入口页面打包之后页面之间的跳转，打包之后两页面在同一个域名之下，所以直接指向该页面即可 */}
                <a href="aboutIndex.html">{updateInfoData}</a>
                <div className='scrollInfo'>
                    <List
                        size="small"
                        header={<div>Header</div>}
                        footer={<div>Footer</div>}
                        bordered={false}
                        split
                        dataSource={scrollInfo.map(val => val.id)}
                        renderItem={(item) => <List.Item onClick={(e) => this.onSelectListItem(item)} > {item}</List.Item>}
                        className="List"
                    />
                    <div className='splitLine'></div>
                    <div className='scrollInfoRight' ref={ref => this.scrollPanel = ref} style={{ overflowY: 'auto' }}>
                        {scrollInfo.map((e, index) => <ScrollInfoTable key={index} id={e.id} name={e.name} isScrollClick={selectListId && selectListId == e.id} handleOnScroll={this.handleOnScroll} />)}
                    </div>
                </div>
            </div >
        )
    }

}


