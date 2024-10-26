import React, { Component, Suspense } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'reactstrap';
import { getVersion } from "../../actions/versionActions";

import {
    CBreadcrumb,
    CFooter,
    CHeader,
    CSidebar,
    CSidebarBrand,
    CSidebarHeader,
    CSidebarNav,
} from '@coreui/react';

// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import { connect } from "react-redux";
import { AUTH_KEY, LOGIN_TOKEN } from "../../utils/Constants";
import ErrorBoundary from "../../ErrorHandling/ErrorBoundary";

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const VERSION_NAV_ITEM_ATTRS = {
    attributes: { target: '_blank' },
    class: 'mt-auto',
    icon: 'cui-cog',
    url: 'https://rclone.org/changelog',
    variant: 'success'
};

// Компонент-обертка для использования хуков навигации
const DefaultLayoutWithNavigation = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    return <DefaultLayout {...props} navigate={navigate} location={location} />;
};

class DefaultLayout extends Component {
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    get navConfig() {
        return {
            items: [
                ...navigation.items,
                {
                    name: this.props.version.version,
                    ...VERSION_NAV_ITEM_ATTRS
                }
            ]
        }
    }

    componentDidMount() {
        if (!localStorage.getItem(AUTH_KEY) || window.location.href.indexOf(LOGIN_TOKEN) > 0) {
            this.props.navigate('/login');
        } else {
            this.props.getVersion();
        }
    }

    
    signOut = (e) => {
        e.preventDefault();
        localStorage.removeItem(AUTH_KEY);
        this.props.navigate('/login');
    };

    render() {
        return (
            <div className="app" data-test="defaultLayout">
                <ErrorBoundary>
                    <CHeader fixed>
                        <Suspense fallback={this.loading()}>
                            <DefaultHeader onLogout={this.signOut}/>
                        </Suspense>
                    </CHeader>
                    <div className="app-body">
                        <CSidebar fixed visible={true}>
                            <CSidebarHeader/>
                            <Suspense fallback={this.loading()}>
                                <CSidebarNav items={this.navConfig.items} />
                            </Suspense>
                            <CSidebarBrand/>
                        </CSidebar>
                        <main className="main">
                            <CBreadcrumb className="d-md-down-none">
                                {routes.map((route, idx) => route.name ? (
                                    <CBreadcrumb.Item
                                        key={idx}
                                        active={this.props.location.pathname === route.path}
                                        to={route.path}
                                    >
                                        {route.name}
                                    </CBreadcrumb.Item>
                                ) : null)}
                            </CBreadcrumb>
                            <Container fluid>
                                <Suspense fallback={this.loading()}>
                                    <Routes>
                                        {routes.map((route, idx) => {
                                            return route.element ? (
                                                <Route
                                                    key={idx}
                                                    path={route.path}
                                                    element={<route.element />}
                                                />
                                            ) : null;
                                        })}
                                        <Route
                                            path="/"
                                            element={<Navigate to="/dashboard" replace />}
                                        />
                                    </Routes>
                                </Suspense>
                            </Container>
                        </main>
                    </div>
                    <CFooter>
                        <Suspense fallback={this.loading()}>
                            <DefaultFooter/>
                        </Suspense>
                    </CFooter>
                </ErrorBoundary>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.status.isConnected,
    version: state.version,
});

const ConnectedDefaultLayout = connect(
    mapStateToProps, 
    { getVersion }
)(DefaultLayout);

export default DefaultLayoutWithNavigation;