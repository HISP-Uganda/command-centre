import React from 'react'
import { Select } from 'antd';
import { units } from '../utils'

const { Option } = Select;

export class SearchOrgUnit extends React.Component {
    state = {
        data: units,
    };

    handleSearch = value => {
        const data = units.filter(f => {
            return String(f.name).toLowerCase().includes(String(value).toLowerCase())
        })
        this.setState({ data });
    };

    render() {
        const { onChange, value, placeholder, style } = this.props
        const options = this.state.data.map(d => <Option key={d.id}>{d.name}</Option>);
        return (
            <Select
                showSearch
                value={value}
                placeholder={placeholder}
                style={style}
                // defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={this.handleSearch}
                onChange={onChange}
                notFoundContent={null}
                size="large"
            >
                {options}
            </Select>
        );
    }
}