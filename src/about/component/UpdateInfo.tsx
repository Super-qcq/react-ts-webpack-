import * as React from 'react'
import { Button, Modal } from 'antd'

interface UpdateInfoProps {
    updateInfo: (data: string) => void
}
interface UpdateInfoStates {

}

/**
 * 上传任务列表
 *
 * @author
 */
export class UpdateInfo extends React.Component<UpdateInfoProps, UpdateInfoStates> {

    constructor(props: UpdateInfoProps) {
        super(props)
        this.state = {

        }
    }



    componentDidMount(): void {

    }

    render() {
        return (
            <div className='header'>
                子组件向父组件传递数据<input type="text" onChange={event => this.props.updateInfo(event.target.value)} />

            </div>
        )
    }

}


