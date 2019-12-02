
import React from 'react';
import { Spin } from 'antd';
const Loading = () => <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '80vh'
}}>
    <Spin size="large" />
</div>;

export default Loading;