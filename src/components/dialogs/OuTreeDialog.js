import { Button } from "antd";
import React from "react";
import { inject, observer } from "mobx-react";
import OrgUnitDialog from '@dhis2/d2-ui-org-unit-dialog';

@inject('store')
@observer
class OuTreeDialog extends React.Component {

    store = null;

    constructor(props) {
        super(props);
        const { d2, store } = props;
        store.setD2(d2);
        this.store = store;
    }

    render() {
        return (
            <div style={{ marginLeft: 'auto' }}>
                <div >
                    <Button ghost size="large" htmlType="button" type="primary" onClick={this.store.toggleDialog}>
                        Filter
                    </Button>
                </div>
                {this.store.root &&
                    <OrgUnitDialog
                        open={this.store.orgUnitDialog.open}
                        root={this.store.root}
                        d2={this.store.d2}
                        selected={this.store.selected}
                        userOrgUnits={this.store.userOrgUnits}
                        level={this.store.level}
                        group={this.store.group}
                        levelOptions={this.store.levelOptions}
                        groupOptions={this.store.groupOptions}
                        onLevelChange={this.store.onLevelChange}
                        onGroupChange={this.store.onGroupChange}
                        onDeselectAllClick={this.store.onDeselectAllClick}
                        handleUserOrgUnitClick={this.store.handleUserOrgUnitClick}
                        handleOrgUnitClick={this.store.handleOrgUnitClick}
                        handleMultipleOrgUnitsSelect={this.store.handleMultipleOrgUnitsSelect}
                        deselectAllTooltipBackgroundColor="#E0E0E0"
                        deselectAllTooltipFontColor="#000000"
                        displayNameProperty={'displayName'}
                        onClose={this.store.toggleDialog}
                        onUpdate={this.store.onOrgUnitSelect}
                        checkboxColor="secondary"
                        maxWidth="lg"
                    />
                }
            </div>
        );
    }

}

export default OuTreeDialog;
