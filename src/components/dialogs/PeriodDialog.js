import {Button} from "antd";
import React from "react";
import {inject, observer} from "mobx-react";
import PeriodSelectorDialog from '@dhis2/d2-ui-period-selector-dialog';
import * as PropTypes from "prop-types";

@inject('store')
@observer
class PeriodDialog extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const {d2, store} = props;
        store.setD2(d2);
        this.store = store;
    }

    render() {
        return (
            <div>
                <div style={{paddingRight: 10}}>
                    <Button size="large" htmlType="button" type="primary" onClick={this.store.management.togglePeriodDialog}>Select period</Button>
                </div>
                <PeriodSelectorDialog
                    d2={this.props.d2}
                    open={this.store.management.dialogOpened}
                    onClose={this.store.management.onClose}
                    onUpdate={this.store.management.onUpdate}
                    selectedItems={this.store.management.selectedPeriods}
                    onReorder={this.store.management.onReorder}
                    onSelect={this.store.management.setSelectedPeriods}
                    onDeselect={this.store.management.onDeselect}
                />

            </div>
        );
    }
}

PeriodDialog.propTypes = {
    d2: PropTypes.object.isRequired

};


export default PeriodDialog;
