import React, { useEffect, useHistory } from 'react';
import { inject, observer } from "mobx-react";
import {
    useParams
} from "react-router-dom";



const ChecklistItem = inject('store')(observer(({ store }) => {
    let { item } = useParams();
    store.check.setSection(item)
    // useEffect(() => {
    //     async function change() {
    //         await store.fetchChecklist();
    //     }
    //     change();
    // }, [])

    return <div>

    </div>
}));

export default ChecklistItem
