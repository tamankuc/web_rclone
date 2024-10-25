import React, { useState } from "react";
import {Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from "reactstrap";
import * as PropTypes from "prop-types";
import * as RclonePropTypes from "../../../utils/RclonePropTypes";
import NewMountModal from "../../MountDashboard/NewMountModal";

function FileActions({downloadHandle, deleteHandle, item, linkShareHandle, getInfoItem, addMount}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const confirmDelete = (deleteHandle, item) => {
        if (window.confirm(`Are you sure you want to delete ${item.Name}`)) {
            deleteHandle(item);
        }
    };

    const handleMountClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Получаем информацию о файле/папке для монтирования
    const itemInfo = getInfoItem();
    const mountPath = itemInfo.Path;
    const remoteName = itemInfo.remoteName;

    // Форматируем путь для монтирования
    const getDefaultMountFs = () => {
        // Убираем двоеточие в конце если оно есть
        const cleanRemoteName = remoteName.endsWith(':') ? remoteName.slice(0, -1) : remoteName;
        
        if (item.IsDir) {
            // Для директорий используем полный путь
            return `${cleanRemoteName}:${mountPath}`;
        } else {
            // Для файлов используем путь к родительской директории
            const parentPath = mountPath.substring(0, mountPath.lastIndexOf('/'));
            return `${cleanRemoteName}:${parentPath || ''}`;
        }
    };

    const handleCreateMount = (mountFs, mountPoint, vfsOptions, mountOptions) => {
        try {
            console.log('Mounting with params:', { mountFs, mountPoint, vfsOptions, mountOptions });
            addMount(mountFs, mountPoint, "", vfsOptions, mountOptions);
            handleModalClose();
        } catch (error) {
            console.error('Mount failed:', error);
        }
    };

    const {IsDir} = item;

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
                    <DropdownItem data-test="btn-mount" onClick={handleMountClick}>
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

            <NewMountModal 
                isOpen={isModalOpen}
                toggle={handleModalClose}
                okHandle={handleCreateMount}
                defaultMountFs={getDefaultMountFs()}
            />
        </div>
    );
}

FileActions.propTypes = {
    downloadHandle: PropTypes.func.isRequired,
    deleteHandle: PropTypes.func.isRequired,
    item: RclonePropTypes.PROP_ITEM.isRequired,
    linkShareHandle: PropTypes.func.isRequired,
    getInfoItem: PropTypes.func.isRequired,
    addMount: PropTypes.func.isRequired,
};

export default FileActions;