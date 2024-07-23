import * as React from 'react'
import { Button, List, Modal } from 'antd'

interface ScrollInfoTableProps {
    id: string,
    name: string,
    isScrollClick: boolean,
    handleOnScroll: (container: any) => void
}
interface ScrollInfoTableStates {

}

/**
 * 上传任务列表
 *
 * @author
 */
export class ScrollInfoTable extends React.Component<ScrollInfoTableProps, ScrollInfoTableStates> {
    container: any

    constructor(props: ScrollInfoTableProps) {
        super(props)
        this.state = {

        }
    }



    componentDidMount(): void {

    }
    componentDidUpdate(prevProps: Readonly<ScrollInfoTableProps>, prevState: Readonly<ScrollInfoTableStates>, snapshot?: any): void {
        const { isScrollClick, handleOnScroll } = this.props
        if (isScrollClick) {
            // 将要滚动到的区域传出
            handleOnScroll(this.container)
        }
    }

    render() {
        const { id, name } = this.props
        return (
            <div ref={ref => this.container = ref}>
                <div style={{ height: '200px', backgroundColor:'#000' }}>
                    qcq+{id}
                </div>
            </div>
        )
    }

}


