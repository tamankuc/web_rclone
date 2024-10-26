import React from "react";
import {Card, CardBody, CardFooter} from "reactstrap";
import { connect } from 'react-redux';
import {ItemTypes} from './Constants';
import {DragSource} from 'react-dnd';
import {formatBytes} from "../../../utils/Tools";
import {performCopyFile, performMoveFile} from "../../../utils/API/API";
import {toast} from "react-toastify";
import * as PropTypes from "prop-types";
import MediaWidget, {isMedia} from "../../Base/MediaWidget/MediaWidget";
import {PROP_ITEM} from "../../../utils/RclonePropTypes";
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import FileActions from "./FileActions";
import FileIcon from "./FileIcon";
import NewMountModal from "../../MountDashboard/NewMountModal";
import {addMount} from "../../../actions/mountActions";

async function performCopyMoveOperation(params) {
    const {srcRemoteName, srcRemotePath, destRemoteName, destRemotePath, Name, IsDir, dropEffect, updateHandler} = params;
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

const fileComponentSource = {
    canDrag(props) {
        return true;
    },
    beginDrag(props) {
        const {Name, Path, IsDir} = props.item;
        return {
            Name: Name, Path: Path, IsDir: IsDir, remoteName: props.remoteName, remotePath: props.remotePath
        };
    },
    endDrag(props, monitor, component) {
        try {
            if (monitor.getDropResult() && component) {
                performCopyMoveOperation(monitor.getDropResult());
            }
        } catch (e) {
            const error = e.response ? e.response : e;
            console.log(JSON.stringify(error));
            toast.error(`Error copying file(s). ${error}`, {
                autoClose: false
            });
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

class FileComponent extends React.Component {
    getInfoItem(props) {
        return {
            Name: props.item.Name,
            Path: props.item.Path,
            IsDir: props.item.IsDir,
            remoteName: props.remoteName,
            remotePath: props.remotePath
        };
    }

    handleClick(IsDir, clickHandler, e, item) {
        if (IsDir) {
            clickHandler(e, item);
        }
    }

    handleCreateNewMount = (mountFs, mountPoint, vfsOptions, mountOptions) => {
        try {
            console.log("handleCreateNewMount", mountFs, mountPoint, vfsOptions, mountOptions);
            const {addMount} = this.props;
            
            if (!mountFs || !mountPoint) {
                throw new Error('Mount filesystem and mount point are required');
            }
            
            // addMount(mountFs, mountPoint, mountType, vfsOptions, mountOptions);
            addMount(mountFs, mountPoint, "", vfsOptions, mountOptions);
        } catch (error) {
            console.error('Mount creation failed:', error);
            toast.error(error.message);
        }
    }

    render() {
        const {
            containerID,
            inViewport,
            item,
            loadImages,
            clickHandler,
            downloadHandle,
            linkShareHandle,
            deleteHandle,
            connectDragSource,
            gridMode
        } = this.props;

        const {IsDir, MimeType, ModTime, Name, Size} = item;
        const infoItemRemote = this.getInfoItem(this.props);
        const modTime = new Date(ModTime);
        
        let element;
        if (gridMode === "card") {
            element = connectDragSource(
                <div className={IsDir ? "" : "col-md-4"}>
                    <Card>
                        <CardBody onClick={(e) => this.handleClick(IsDir, clickHandler, e, item)}>
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
                                addMount={this.handleCreateNewMount}
                            />
                            <NewMountModal
                                buttonLabel="Create new mount"
                                okHandle={this.handleCreateNewMount}
                            />
                        </CardFooter>
                    </Card>
                </div>
            );
        } else {
            element = connectDragSource(
                <tr className="pointer-cursor fadeIn">
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
                            addMount={this.handleCreateNewMount}
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
                {/* <NewMountModal
                    buttonLabel="Create new mount"
                    okHandle={this.handleCreateNewMount}
                /> */}
            </ErrorBoundary>
        );
    }
}

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

const mapStateToProps = null;

const mapDispatchToProps = {
    addMount
};

// Сначала подключаем Redux, затем DragSource
export default DragSource(
    ItemTypes.FILECOMPONENT,
    fileComponentSource,
    collect
)(connect(mapStateToProps, mapDispatchToProps)(FileComponent));