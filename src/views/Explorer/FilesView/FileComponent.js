import React from "react";
import { Card, CardBody, CardFooter } from "reactstrap";
import { connect } from 'react-redux';
import { ItemTypes } from './Constants';
import { useDrag } from 'react-dnd';
import { formatBytes } from "../../../utils/Tools";
import { performCopyFile, performMoveFile } from "../../../utils/API/API";
import { toast } from "react-toastify";
import * as PropTypes from "prop-types";
import MediaWidget, { isMedia } from "../../Base/MediaWidget/MediaWidget";
import { PROP_ITEM } from "../../../utils/RclonePropTypes";
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import FileActions from "./FileActions";
import FileIcon from "./FileIcon";
import NewMountModal from "../../MountDashboard/NewMountModal";
import { addMount } from "../../../actions/mountActions";

async function performCopyMoveOperation(params) {
    const { srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir, dropEffect, updateHandler } = params;
    if (dropEffect === "move") {
        await performCopyFile(srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir);
        updateHandler();
        if (IsDir) {
            toast.info(`Directory copying started in background: ${Name}`);
        } else {
            toast.info(`File copying started in background: ${Name}`);
        }
    } else {
        await performMoveFile(srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir);
        updateHandler();
        if (IsDir) {
            toast.info(`Directory moving started in background: ${Name}`);
        } else {
            toast.info(`Directory moving started in background: ${Name}`);
        }
    }
}

const FileComponent = ({
    containerID,
    inViewport,
    item,
    loadImages,
    clickHandler,
    downloadHandle,
    linkShareHandle,
    deleteHandle,
    remoteName,
    remotePath,
    gridMode,
    addMount
}) => {
    const getInfoItem = () => ({
        Name: item.Name,
        Path: item.Path,
        IsDir: item.IsDir,
        remoteName,
        remotePath
    });

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.FILECOMPONENT,
        item: () => {
            const { Name, Path, IsDir } = item;
            return {
                Name,
                Path,
                IsDir,
                remoteName,
                remotePath
            };
        },
        end: (item, monitor) => {
            try {
                if (monitor.getDropResult()) {
                    performCopyMoveOperation(monitor.getDropResult());
                }
            } catch (e) {
                const error = e.response ? e.response : e;
                console.log(JSON.stringify(error));
                toast.error(`Error copying file(s). ${error}`, {
                    autoClose: false
                });
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [item, remoteName, remotePath]);

    const handleClick = (IsDir, clickHandler, e, item) => {
        if (IsDir) {
            clickHandler(e, item);
        }
    };

    const handleCreateNewMount = (mountFs, mountPoint, vfsOptions, mountOptions) => {
        try {
            console.log("handleCreateNewMount", mountFs, mountPoint, vfsOptions, mountOptions);
            
            if (!mountFs || !mountPoint) {
                throw new Error('Mount filesystem and mount point are required');
            }
            
            addMount(mountFs, mountPoint, "", vfsOptions, mountOptions);
        } catch (error) {
            console.error('Mount creation failed:', error);
            toast.error(error.message);
        }
    };

    const { IsDir, MimeType, ModTime, Name, Size } = item;
    const infoItemRemote = getInfoItem();
    const modTime = new Date(ModTime);

    let element;
    if (gridMode === "card") {
        element = (
            <div ref={drag} className={IsDir ? "" : "col-md-4"}>
                <Card>
                    <CardBody onClick={(e) => handleClick(IsDir, clickHandler, e, item)}>
                        {loadImages && isMedia(MimeType) ?
                            <MediaWidget containerID={containerID} item={item} inViewport={inViewport}/> :
                            <FileIcon IsDir={IsDir} MimeType={MimeType}/>
                        }
                        {Name}
                    </CardBody>
                    <CardFooter>
                        <FileActions
                            downloadHandle={downloadHandle}
                            linkShareHandle={linkShareHandle}
                            deleteHandle={deleteHandle}
                            item={item}
                            getInfoItem={() => infoItemRemote}
                            addMount={handleCreateNewMount}
                        />
                        <NewMountModal
                            buttonLabel="Create new mount"
                            okHandle={handleCreateNewMount}
                        />
                    </CardFooter>
                </Card>
            </div>
        );
    } else {
        element = (
            <tr ref={drag} className="pointer-cursor fadeIn">
                <td onClick={(e) => clickHandler(e, item)}>
                    <FileIcon IsDir={IsDir} MimeType={MimeType}/>{" "}{Name}
                </td>
                <td>{Size === -1 ? "-" : formatBytes(Size, 2)}</td>
                <td className="d-none d-md-table-cell">{modTime.toLocaleDateString()}</td>
                <td>
                    <FileActions
                        downloadHandle={downloadHandle}
                        linkShareHandle={linkShareHandle}
                        deleteHandle={deleteHandle}
                        item={item}
                        getInfoItem={() => infoItemRemote}
                        addMount={handleCreateNewMount}
                    />
                </td>
                <td>
                    <div className="status-indicator"></div>
                </td>
            </tr>
        );
    }

    return (
        <ErrorBoundary>
            {element}
        </ErrorBoundary>
    );
};

FileComponent.propTypes = {
    item: PROP_ITEM.isRequired,
    clickHandler: PropTypes.func.isRequired,
    downloadHandle: PropTypes.func.isRequired,
    deleteHandle: PropTypes.func.isRequired,
    linkShareHandle: PropTypes.func.isRequired,
    remoteName: PropTypes.string.isRequired,
    remotePath: PropTypes.string.isRequired,
    gridMode: PropTypes.string,
    containerID: PropTypes.string.isRequired,
    canMove: PropTypes.bool.isRequired,
    canCopy: PropTypes.bool.isRequired,
    loadImages: PropTypes.bool.isRequired,
    isBucketBased: PropTypes.bool.isRequired,
    addMount: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    addMount
};

export default connect(null, mapDispatchToProps)(FileComponent);