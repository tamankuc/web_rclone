import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';

import {CSidebarBrand, CSidebarToggler} from '@coreui/react';
import logo from '../../assets/img/brand/logo.png'
import favicon from '../../assets/img/brand/favicon.png'
import BackendStatusCard from "../../views/Base/BackendStatusCard/BackendStatusCard";

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
    render() {

        // eslint-disable-next-line
        const {children, ...attributes} = this.props;

        return (
            <React.Fragment>
                <CSidebarToggler className="d-lg-none" display="md" mobile/>
                <CSidebarBrand
                    full={{src: logo, width: 89, height: 25, alt: 'Rclone Logo'}}
                    minimized={{src: favicon, width: 30, height: 30, alt: 'Rclone Logo'}}
                />
                <CSidebarToggler className="d-md-down-none" display="lg"/>

                <Nav className="d-md-down-none" navbar>
                    <NavItem className="px-3">
                        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                    </NavItem>

                </Nav>
                <Nav className="ml-auto" navbar>
                    <BackendStatusCard mode={"button"}/>
                </Nav>

            </React.Fragment>
        );
    }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
