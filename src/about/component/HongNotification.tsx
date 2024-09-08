/**
 * 自己封装的提示框
 */
import { notification } from 'antd';
//此处根据自己需求定义,也可以不进行匹配
const NotificationType = {
    NetError: -1,
    ServerError: -2,
    OtherError: -3,
}

interface NotificationConfig {
    msg?;
    duration?: number;
}

const HongNotification = {
    //配置默认[config],此处可修改
    defaultConfig: () => ({
        message: '提示框',
        duration: 2, //默认自动关闭延时，单位秒
    }),
    // 二次确认
    base: (type, beforeConfig) => {
        let config = beforeConfig;
        //当传入的提示内容为空,提示写死的内容
        if (config.msg === '') {
            config = {
                msg: '请稍候重试',
            };
        }
        config.description = config.msg;
        delete config.msg;

        notification[type](
            { ...HongNotification.defaultConfig(), ...config }
        );
    },
    success: (config: NotificationConfig = {}) => {
        if (!config.msg) {
            config.msg = ''
        }
        HongNotification.base('success', config);
    },
    info: config => {
        HongNotification.base('info', config);
    },
    warning: config => {
        HongNotification.base('warning', config);
    },
    error: config => {
        console.log(config);
        // 传入的错误信息为-1 固定都是提示网络问题
        if (config.msg == NotificationType.NetError) {
            config.msg = '网络异常，请检查网络环境后重试';
            //传入为-2,提示为服务器繁忙，请稍后重试错误 
        } else if (config.msg == NotificationType.ServerError) {
            config.msg = '服务器繁忙，请稍后重试';
            //传入为-3,其他某种错误提示[可以自己定]
        } else if (config.msg == NotificationType.OtherError) {
            config.msg = '请稍候重试'
        }
        //调用二次确认函数
        HongNotification.base('error', config);
        //,如果不需要写死的数据,这样调用即可
        //  HongNotification.base('error', {{msg:"努力学习的汪!!"}});
    },
    open: config => {
        HongNotification.base('open', config);
    },
};

export default HongNotification;