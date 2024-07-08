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
            method: 'POST',
            url: '/api/axios-server',
            data: {
                username: 'qcq',
                password: 'qcq'
            }
        }).then(value => {
            this.setState({
                data: value.data.name
            })
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
            </div>
        )
    }
    t
}


