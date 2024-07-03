import * as React from 'react'
import '../css/task.less'
import { Button, Modal } from 'antd'

interface DeliveryTaskListProps { }
interface DeliveryTaskListStates {
    isModal: boolean
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
            isModal: false
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

    componentDidMount(): void { }

    render() {
        const { isModal } = this.state
        return (
            <div className='header'>
                <Button type='primary' onClick={() => this.isModalOpen(true)} >
                    提交e1qcq
                </Button>
                <a href='http://localhost:8080/home'>dsadasda</a>
                <Modal
                    title='Basic Modal'
                    open={isModal}
                    onCancel={() => this.isModalOpen(false)}
                >
                    <p>请问qcq</p>
                    <p>Some contentdawdas...</p>
                    <p>wwwqqqqqqqqqqqqqqqqqqqqqqqqqqqqSome contents...</p>
                   
                </Modal>
            </div>
        )
    }
    t
}
