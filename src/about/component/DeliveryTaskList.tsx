import * as React from 'react'
import '../css/task.less'
import { Button, Modal } from 'antd'
import axios from 'axios';

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
                <Button type='primary' onClick={() => this.isModalOpen(true)} >
                    提交e1qcq
                </Button>
                <Modal
                    title='Basic Modal'
                    open={isModal}
                    onCancel={() => this.isModalOpen(false)}
                    onOk={() => this.getData()}
                >
                    <p>qcq</p>
                    <p>{data && data}</p>

                </Modal>
                <img src='../staticFile/3Xihnvg6nt.jpg'></img>
                <div className='img'></div>
            </div>
        )
    }

}


