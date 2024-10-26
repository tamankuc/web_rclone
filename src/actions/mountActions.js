import axiosInstance from "../utils/API/API";
import urls from "../utils/API/endpoint";
import {CREATE_MOUNT, GET_MOUNT_LIST, REMOVE_MOUNT, REQUEST_ERROR, REQUEST_SUCCESS} from "./types";

export const getMountList = () => {
    return (dispatch) => {
        axiosInstance.post(urls.listMounts)
            .then(res => {
                dispatch({
                    type: GET_MOUNT_LIST,
                    status: REQUEST_SUCCESS,
                    payload: res.data
                });
            })
            .catch(error => {
                dispatch({
                    type: GET_MOUNT_LIST,
                    status: REQUEST_ERROR,
                    payload: error
                });
            });
    };
};

export const addMount = (fs, mountPoint, mountType, vfsOpt = {}, mountOpt = {}) => {
    const normalizedFs = fs.endsWith(":") ? fs : `${fs}`;
    
    // Убедимся, что опции всегда являются объектами
    const normalizedVfsOpt = typeof vfsOpt === 'object' && vfsOpt !== null ? vfsOpt : {};
    const normalizedMountOpt = typeof mountOpt === 'object' && mountOpt !== null ? mountOpt : {};

    // Форматируем данные для запроса
    const requestData = {
        fs: normalizedFs,
        mountPoint,
        mountType: mountType || "",
        vfsOpt: normalizedVfsOpt,
        mountOpt: normalizedMountOpt
    };

    console.log('Mount request data:', requestData);

    return (dispatch) => {
        axiosInstance.post(urls.createMount, requestData)
            .then(res => {
                dispatch({
                    type: CREATE_MOUNT,
                    status: REQUEST_SUCCESS,
                    payload: res.data
                });
                dispatch(getMountList());
                if (res.data.configSaved) {
                    console.log('Mount configuration saved successfully');
                } else {
                    console.log('Mount created, but configuration not saved');
                }
            })
            .catch(error => {
                console.error('Mount error:', error);
                dispatch({
                    type: CREATE_MOUNT,
                    status: REQUEST_ERROR,
                    payload: error
                });
            });
    };
};

export const unmount = (mountPoint) => {
    return (dispatch) => {
        axiosInstance.post(urls.removeMount, { mountPoint })
            .then(res => {
                dispatch({
                    type: REMOVE_MOUNT,
                    status: REQUEST_SUCCESS,
                    payload: res.data
                });
                dispatch(getMountList());
            })
            .catch(error => {
                dispatch({
                    type: REMOVE_MOUNT,
                    status: REQUEST_ERROR,
                    payload: error
                });
            });
    };
};

export const unmountAll = () => {
    return (dispatch) => {
        axiosInstance.post(urls.unmountAll)
            .then(res => {
                dispatch({
                    type: REMOVE_MOUNT,
                    status: REQUEST_SUCCESS,
                    payload: res.data
                });
                dispatch(getMountList());
            })
            .catch(error => {
                dispatch({
                    type: REMOVE_MOUNT,
                    status: REQUEST_ERROR,
                    payload: error
                });
            });
    };
};
