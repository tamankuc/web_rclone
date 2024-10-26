import React from "react";
import axiosInstance from "../../../utils/API/API";
import {Alert, Col, Container, Row, Spinner, Table} from "reactstrap";
import {useDrop} from 'react-dnd';
import FileComponent from "./FileComponent";
import {ItemTypes} from "./Constants";
import {toast} from "react-toastify";
import {
    addColonAtLast,
    changeListVisibility,
    changeSearchFilter,
    getSortCompareFunction,
    isEmpty
} from "../../../utils/Tools";
import {connect} from "react-redux";
import {getFiles} from "../../../actions/explorerActions";
import {compose} from "redux";
import {changePath, changeSortFilter, navigateUp} from "../../../actions/explorerStateActions";
import LinkShareModal from "../../Base/LinkShareModal/LinkShareModal";
import ScrollableDiv from "../../Base/ScrollableDiv/ScrollableDiv";
import {FILES_VIEW_HEIGHT} from "../../../utils/Constants";
import {PROP_CURRENT_PATH, PROP_FS_INFO} from "../../../utils/RclonePropTypes";
import * as PropTypes from 'prop-types';
import ErrorBoundary from "../../../ErrorHandling/ErrorBoundary";
import {createNewPublicLink, deleteFile, purgeDir} from "rclone-api";
import {createSelector} from "reselect";
import DropOverlay from "../../Base/DropOverlay/DropOverlay";

// FilesViewWithDnD компонент для обработки drag and drop
const FilesViewWithDnD = (props) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.FILECOMPONENT,
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;

            const { Name, Path, IsDir, remoteName } = item;
            const srcRemoteName = addColonAtLast(remoteName);
            const srcRemotePath = Path;
            const destRemoteName = addColonAtLast(props.currentPath.remoteName);
            const destRemotePath = props.currentPath.remotePath;

            return {
                srcRemoteName,
                srcRemotePath,
                destRemoteName,
                destRemotePath,
                Name,
                IsDir,
                updateHandler: props.updateHandler
            };
        },
        canDrop: (item) => {
            const { remoteName, remotePath } = item;
            const destRemoteName = props.currentPath.remoteName;
            const destRemotePath = props.currentPath.remotePath;
            if (destRemoteName === remoteName) {
                return destRemotePath !== remotePath;
            }
            return true;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return <FilesView {...props} dropRef={drop} isOver={isOver} canDrop={canDrop} />;
};

class FilesView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isDownloadProgress: false,
            downloadingItems: 0,
            shouldUpdate: true,
            showLinkShareModal: false,
            generatedLink: "",
        };
        this.handleFileClick = this.handleFileClick.bind(this);
        this.downloadHandle = this.downloadHandle.bind(this);
        this.deleteHandle = this.deleteHandle.bind(this);
    }

    closeLinkShareModal = () => {
        this.setState({
            showLinkShareModal: false
        });
    };

    showLinkShareModal = () => {
        this.setState({
            showLinkShareModal: true
        });
    };

    handleFileClick(e, item) {
        const {Path, IsDir, IsBucket} = item;
        if (IsDir || IsBucket) {
            this.updateRemotePath(Path, IsDir, IsBucket);
        } else {
            this.downloadHandle(item);
        }
    }

    updateRemotePath(newRemotePath, IsDir, IsBucket) {
        const {remoteName} = this.props.currentPath;
        let updateRemoteName = "";
        let updateRemotePath = "";

        if (IsBucket) {
            updateRemoteName = addColonAtLast(remoteName) + newRemotePath;
            updateRemotePath = "";
        } else if (IsDir) {
            updateRemoteName = remoteName;
            updateRemotePath = newRemotePath;
        }
        this.props.changePath(this.props.containerID, updateRemoteName, updateRemotePath);
    }

    getFilesList() {
        const {remoteName, remotePath} = this.props.currentPath;
        this.props.getFiles(remoteName, remotePath);
    }

    async downloadHandle(item) {
        const {remoteName, remotePath} = this.props.currentPath;
        const {fsInfo} = this.props;
        let downloadUrl = "";
        
        if (fsInfo.Features.BucketBased) {
            downloadUrl = `/[${remoteName}]/${remotePath}/${item.Name}`;
        } else {
            downloadUrl = `/[${remoteName}:${remotePath}]/${item.Name}`;
        }

        this.setState((prevState) => ({
            downloadingItems: prevState.downloadingItems + 1,
            isDownloadProgress: true
        }));

        try {
            const response = await axiosInstance({
                url: downloadUrl,
                method: 'GET',
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', item.Name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(`Error downloading file: ${error.message}`);
        }

        this.setState((prevState) => ({
            downloadingItems: prevState.downloadingItems - 1,
            isDownloadProgress: prevState.downloadingItems === 1 ? false : true
        }));
    }

    async deleteHandle(item) {
        const {remoteName} = this.props.currentPath;

        try {
            if (item.IsDir) {
                await purgeDir(remoteName, item.Path);
                toast.info(`${item.Name} deleted.`);
            } else {
                await deleteFile(remoteName, item.Path);
                toast.info(`${item.Name} deleted.`);
            }
            this.updateHandler();
        } catch (error) {
            toast.error(`Error deleting file: ${error.message}`, {
                autoClose: false
            });
        }
    }

    updateHandler = () => {
        this.getFilesList();
    };

    dismissAlert = () => {
        this.setState({isDownloadProgress: false});
    };

    linkShareHandle = async (item) => {
        const {fsInfo} = this.props;
        if (!fsInfo.Features.PublicLink) {
            toast.error("This remote does not support public link");
            return;
        }

        try {
            const {remoteName} = this.props.currentPath;
            const response = await createNewPublicLink(remoteName, item.Path);
            this.setState({
                generatedLink: response.url,
                showLinkShareModal: true
            });
        } catch (error) {
            toast.error(`Error generating link: ${error.message}`);
        }
    };

    getFileComponents = (isDir) => {
        const {files, containerID, gridMode, fsInfo, loadImages} = this.props;
        const {remoteName, remotePath} = this.props.currentPath;

        if (!fsInfo || isEmpty(fsInfo)) return [];

        return files.reduce((result, item) => {
            let {ID, Name} = item;
            if (ID === undefined) {
                ID = Name;
            }
            if (item.IsDir === isDir) {
                result.push(
                    <FileComponent 
                        key={ID} 
                        item={item} 
                        clickHandler={this.handleFileClick}
                        downloadHandle={this.downloadHandle} 
                        deleteHandle={this.deleteHandle}
                        remoteName={remoteName} 
                        remotePath={remotePath} 
                        gridMode={gridMode}
                        containerID={containerID}
                        linkShareHandle={this.linkShareHandle}
                        loadImages={loadImages}
                        isBucketBased={fsInfo.Features.BucketBased}
                        canCopy={fsInfo.Features.Copy} 
                        canMove={fsInfo.Features.Move} 
                        itemIdx={1}
                    />
                );
            }
            return result;
        }, []);
    };

    applySortFilter = (sortFilter) => {
        const {changeSortFilter, containerID, sortFilterAscending} = this.props;
        return changeSortFilter(containerID, sortFilter, 
            this.props.sortFilter === sortFilter ? !sortFilterAscending : true);
    };

    render() {
        const {isLoading, isDownloadProgress, downloadingItems, generatedLink, showLinkShareModal} = this.state;
        const {dropRef, isOver, files, gridMode, canDrop, sortFilter, sortFilterAscending, remoteName} = this.props;

        if (isLoading || !files) {
            return <div><Spinner color="primary"/> Loading</div>;
        }

        if (remoteName === "") {
            return <div>No remote is selected. Select a remote from above to show files.</div>;
        }

        const dirComponents = this.getFileComponents(true);
        const fileComponents = this.getFileComponents(false);

        let content;
        if (gridMode === "card") {
            content = (
                <Container fluid={true}>
                    <Row>
                        <Col lg={3}>
                            <h3>Directories</h3>
                            <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                                {dirComponents}
                            </ScrollableDiv>
                        </Col>
                        <Col lg={9}>
                            <h3>Files</h3>
                            <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                                <Row>
                                    {fileComponents}
                                </Row>
                            </ScrollableDiv>
                        </Col>
                    </Row>
                </Container>
            );
        } else {
            const filterIconClass = sortFilterAscending ? "fa fa-lg fa-arrow-up" : "fa fa-lg fa-arrow-down";
            content = (
                <Container fluid={true} className="p-0">
                    <ScrollableDiv height={FILES_VIEW_HEIGHT}>
                        <Table className="table table-responsive-sm table-striped table-fix-head">
                            <thead>
                                <tr>
                                    <th className="pointer-cursor" onClick={() => this.applySortFilter("name")}>
                                        Name {sortFilter === "name" && <i className={filterIconClass}/>}
                                    </th>
                                    <th className="pointer-cursor" onClick={() => this.applySortFilter("size")}>
                                        Size {sortFilter === "size" && <i className={filterIconClass}/>}
                                    </th>
                                    <th className="d-none d-md-table-cell pointer-cursor" onClick={() => this.applySortFilter("modified")}>
                                        Modified {sortFilter === "modified" && <i className={filterIconClass}/>}
                                    </th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.length > 0 ? (
                                    <>
                                        <tr><th colSpan={5}>Directories</th></tr>
                                        {dirComponents}
                                        <tr><th colSpan={5}>Files</th></tr>
                                        {fileComponents}
                                    </>
                                ) : (
                                    <tr><th colSpan={5}>Files</th></tr>
                                )}
                            </tbody>
                        </Table>
                    </ScrollableDiv>
                </Container>
            );
        }

        return (
            <div className="row" ref={dropRef}>
                {isOver && canDrop && <DropOverlay/>}
                <ErrorBoundary>
                    <Alert color="info" isOpen={isDownloadProgress} toggle={this.dismissAlert} sm={12} lg={12}>
                        Downloading {downloadingItems} file(s). Please wait.
                    </Alert>
                    {content}
                    <LinkShareModal 
                        closeModal={this.closeLinkShareModal} 
                        isVisible={showLinkShareModal}
                        linkUrl={generatedLink}
                    />
                </ErrorBoundary>
            </div>
        );
    }
}

FilesView.propTypes = {
    containerID: PropTypes.string.isRequired,
    currentPath: PROP_CURRENT_PATH.isRequired,
    fsInfo: PROP_FS_INFO,
    gridMode: PropTypes.string,
    searchQuery: PropTypes.string,
    loadImages: PropTypes.bool.isRequired
};

FilesView.defaultProps = {};

const getVisibleFiles = createSelector(
    [
        (state, props) => props.containerID,
        (state, props) => state.explorer.currentPaths[props.containerID],
        (state, props) => state.explorer.visibilityFilters[props.containerID],
        (state, props) => state.explorer.sortFilters[props.containerID],
        (state, props) => state.explorer.searchQueries[props.containerID],
        (state, props) => state.explorer.sortFiltersAscending[props.containerID],
        (state, props) => state.remote.files[`${state.explorer.currentPaths[props.containerID].remoteName}-${state.explorer.currentPaths[props.containerID].remotePath}`],
    ],
    (containerID, currentPath, visibilityFilter, sortFilter, searchQuery, sortFilterAscending, files) => {
        files = files.files;
        
        if (visibilityFilter && visibilityFilter !== "") {
            files = changeListVisibility(files, visibilityFilter);
        }

        if (searchQuery) {
            files = changeSearchFilter(files, searchQuery);
        }

        files.sort(getSortCompareFunction(sortFilter, sortFilterAscending));
        return files;
    }
);
const mapStateToProps = (state, ownProps) => {
    const {currentPaths, gridMode, searchQueries, loadImages, sortFilters, sortFiltersAscending} = state.explorer;
    const {containerID} = ownProps;
    const currentPath = currentPaths[containerID];
    const mgridMode = gridMode[containerID];
    const searchQuery = searchQueries[containerID];
    const mloadImages = loadImages[containerID];
    const sortFilter = sortFilters[containerID];
    const sortFilterAscending = sortFiltersAscending[containerID];
 
    let fsInfo = {};
    const {remoteName, remotePath} = currentPath;
 
    if (currentPath && state.remote.configs) {
        const tempRemoteName = remoteName.split(':')[0];
        if (state.remote.configs[tempRemoteName])
            fsInfo = state.remote.configs[tempRemoteName];
    }
 
    const pathKey = `${remoteName}-${remotePath}`;
    let files = state.remote.files[pathKey];
 
    if (files) {
        files = getVisibleFiles(state, ownProps);
    }
 
    return {
        files,
        currentPath,
        fsInfo,
        gridMode: mgridMode,
        searchQuery,
        loadImages: mloadImages,
        sortFilter,
        sortFilterAscending
    }
 };
 
 export default compose(
    connect(mapStateToProps, {getFiles, navigateUp, changePath, changeSortFilter}),
    // Оборачиваем компонент в DnD
 )(FilesViewWithDnD);