import * as React from 'react'
import '../css/task.less'
import { Button, Modal } from 'antd'
import axios from 'axios';
import { Link, Route, Routes } from 'react-router-dom';
import { AboutDeliveryTaskList } from './aboutDeliveryTaskList';

interface DeliveryTaskListProps { }
interface DeliveryTaskListStates {
    isModal: boolean
    data: ''
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
    constructor(props: DeliveryTaskListProps) {
        super(props)
        this.state = {
            isModal: false,
            data: ''
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

    componentDidMount(): void {

    }

    render() {
        const { isModal, data } = this.state
        return (
            <div className='header'>

                <Routes>
                    <Route path="/about" element={<AboutDeliveryTaskList />}> </Route>
                </Routes>
                <div style={{color:'red'}}>-----------------------------------------------------</div>
                {/* 路由跳转到组件 */}
                <Link className="list-group-item" to="/about">About</Link>
                <Button type='primary' onClick={() => this.isModalOpen(true)} >
                    提交e1qcq
                </Button>
                <Modal
                    title='Basic Modal'
                    open={isModal}
                    onCancel={() => this.isModalOpen(false)}
                    onOk={() => this.getData()}
                >
                    <p>qcqqcqqcq</p>
                    <p>{data && data}</p>

                </Modal>

                <img src={'../imgs/3Xihnvg6nt.jpg'}></img>
                <div className='img'></div>
                {/* 多入口页面打包之后页面之间的跳转，打包之后两页面在同一个域名之下，所以直接指向该页面即可 */}
                <a href="aboutIndex.html">跳转到AboutIndex</a>

            </div>
        )
    }

}


