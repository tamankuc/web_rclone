import React from "react";
import {Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from "reactstrap";
import * as PropTypes from "prop-types";
import * as RclonePropTypes from "../../../utils/RclonePropTypes";

function FileActions({downloadHandle, deleteHandle, item, linkShareHandle, getInfoItem}) {
    const confirmDelete = (deleteHandle, item) => {
        if (window.confirm(`Are you sure you want to delete ${item.Name}`)) {
            deleteHandle(item);
        }
    }

    const {IsDir} = item;
    // let {ID, Name} = item;
    // // Using fallback as fileName when the ID is not available (for local file system)
    // if (ID === undefined) {
    //     ID = Name;
    // }

    return (
        <div data-test="fileActionsComponent">
            {!IsDir && <Button color="link" onClick={() => downloadHandle(item)} data-test="btn-download">
                <i className={"fa fa-cloud-download fa-lg d-inline"}/>
            </Button>}
            <Button color="link">
                <i className="fa fa-info-circle"/>
            </Button>

            <UncontrolledButtonDropdown>
                <DropdownToggle color="link">
                    <i className="fa fa-ellipsis-v"/>
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem header>Actions</DropdownItem>
                    <DropdownItem data-test="btn-mount" onClick={() => console.log(item)}>
                        <i className="fa fa-hdd-o fa-lg d-inline"/> Mount
                    </DropdownItem>
                    <DropdownItem data-test="btn-sync" onClick={() => console.log(getInfoItem())}>
                        <i className="fa fa-refresh fa-lg d-inline"/> Synchronize
                    </DropdownItem>
                    <DropdownItem divider/>
                    <DropdownItem data-test="btn-delete-item" onClick={() => confirmDelete(deleteHandle, item)}>
                        <i className="fa fa-remove fa-lg d-inline text-danger"/> Delete
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>


        </div>
    )
}

FileActions.propTypes = {
    downloadHandle: PropTypes.func.isRequired,
    deleteHandle: PropTypes.func.isRequired,
    item: RclonePropTypes.PROP_ITEM.isRequired,
    linkShareHandle: PropTypes.func.isRequired,
    getInfoItem: PropTypes.func.isRequired,
}

export default FileActions;