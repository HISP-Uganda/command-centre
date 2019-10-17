import { action, observable } from 'mobx';
import { RouterStore } from 'mobx-router';
import { MR } from './MR';
class Store {

    @observable d2;
    @observable spinning = true;

    @observable orgUnitDialog = {
        open: false,
    };

    @observable root = undefined;
    @observable userOrgUnits = [];
    @observable MR = new MR();

    @observable selected = [];
    @observable group = [];
    @observable level = [];
    @observable levelOptions = [];
    @observable groupOptions = [];
    @observable router = new RouterStore();
    @observable active = '1'


    @observable dialogOpened = false;

    @observable setOrgUnitDialog = (val) => this.orgUnitDialog = val;
    @observable setRoot = (val) => this.root = val;
    @observable setSelected = (val) => this.selected = val;
    @observable setGroup = (val) => this.group = val;
    @observable setUserOrgUnits = (val) => this.userOrgUnits = val;
    @observable setLevel = (val) => this.level = val;
    @observable setLevelOptions = (val) => this.levelOptions = val;
    @observable setGroupOptions = (val) => this.groupOptions = val;
    @observable setActive = (val) => this.active = val;

    @action setD2 = (val) => this.d2 = val;
    @action setOrganisationUnitGroups = (val) => this.organisationUnitGroups = val;
    @action setOrganisationLevels = (val) => this.organisationLevels = val;
    @action setNumeratorDialogOpen = (val) => this.numeratorDialogOpen = val;
    @action setShowing = (val) => this.showing = val;
    @action startSpinning = () => this.setSpinning(true);
    @action stopSpinning = () => this.setSpinning(false);

    @action setDialogOpened = (val) => this.dialogOpened = val;

    @action onUpdate = async (selectedPeriods) => {
        if (selectedPeriods.length > 0) {
            await this.call();
        }
        this.setDialogOpened(false);
    };

    @action onClose = () => {
        this.setDialogOpened(false);
    };

    @action togglePeriodDialog = () => {
        this.setDialogOpened(!this.dialogOpened);
    };

    @action fetchRoot = async () => {
        const data = await this.d2
            .currentUser
            .getOrganisationUnits({
                paging: false,
                fields: `id,path,name,level,displayShortName~rename(displayName),children::isNotEmpty`,
            });

        const rootLevel = data.toArray()[0];
        this.setRoot(rootLevel)
        this.MR.setD2(this.d2);
        this.setSelected([{ id: rootLevel.id, path: rootLevel.path, level: rootLevel.level, displayName: rootLevel.name }]);
        await this.MR.setCurrentSearch({ id: rootLevel.id, path: rootLevel.path, level: rootLevel.level, displayName: rootLevel.name });
        // this.loadOrgUnitLevels();
        // this.loadOrgUnitGroups();
    };

    @action onOrgUnitSelect = async () => {
        if (this.selected.length > 0) {
            const ou = this.selected[0];
            console.log(ou);
            this.MR.setCurrentSearch(ou);
        }
        this.setOrgUnitDialog(false);
    };

    @action onLevelChange = (event) => {
        this.setLevel(event.target.value)
    };

    @action onGroupChange = (event) => {
        this.setGroup(event.target.value);
    };

    @action onDeselectAllClick = () => {
        this.setSelected([])
    };


    @action toggleDialog = () => {
        this.setOrgUnitDialog({
            open: !this.orgUnitDialog.open,
        })
    };

    @action loadOrgUnitGroups = () => {
        this.d2
            .models
            .organisationUnitGroups
            .list({
                fields: `id,displayShortName~rename(displayName)`,
                paging: false,
            })
            .then((collection) => collection.toArray())
            .then((groupOptions) => this.setGroupOptions(groupOptions));
    };

    @action loadOrgUnitLevels = () => {
        this.d2
            .models
            .organisationUnitLevels
            .list({ paging: false })
            .then((collection) => collection.toArray())
            .then((levelOptions) => this.setLevelOptions(levelOptions));
    };


    @action handleOrgUnitClick = (event, orgUnit) => {
        if (this.selected.some((ou) => ou.path === orgUnit.path)) {
            this.setSelected(this.selected.filter((ou) => ou.path !== orgUnit.path))
        } else {
            this.setSelected([
                { id: orgUnit.id, displayName: orgUnit.displayName, path: orgUnit.path },
            ]);
        }
    };

    @action handleMultipleOrgUnitsSelect = (children) => {
        const selected = [
            ...this.selected,
            ...children.map((orgUnit) => ({
                id: orgUnit.id,
                displayName: orgUnit.displayName,
                path: orgUnit.path,
            })),
        ];

        this.setSelected(selected);
    };

    @action handleUserOrgUnitClick = (event, checked) => {
        if (checked) {
            this.setUserOrgUnits([...this.userOrgUnits, { id: event.target.name }])
        } else {
            this.setUserOrgUnits(this.userOrgUnits.filter((ou) => ou.id !== event.target.name))
        }
    };
}

export const store = new Store();


