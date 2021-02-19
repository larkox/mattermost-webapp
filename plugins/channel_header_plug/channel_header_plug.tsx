// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/no-multi-comp */

import React from 'react';
import {Dropdown, Tooltip} from 'react-bootstrap';
import {RootCloseWrapper} from 'react-overlays';
import {FormattedMessage} from 'react-intl';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {Theme} from 'mattermost-redux/types/preferences';
import {AppBinding, AppCall, AppCallResponse} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes, AppCallTypes} from 'mattermost-redux/constants/apps';

import {ActionResult} from 'mattermost-redux/types/actions';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import PluginChannelHeaderIcon from 'components/widgets/icons/plugin_channel_header_icon';
import {Constants} from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';
import {PluginComponent} from 'types/store/plugins';
import {sendEphemeralPost} from 'actions/global_actions';

type CustomMenuProps = {
    open?: boolean;
    children?: React.ReactNode;
    onClose: () => void;
    rootCloseEvent?: 'click' | 'mousedown';
    bsRole: string;
}

class CustomMenu extends React.PureComponent<CustomMenuProps> {
    handleRootClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            open,
            rootCloseEvent,
            children,
        } = this.props;

        return (
            <RootCloseWrapper
                disabled={!open}
                onRootClose={this.handleRootClose}
                event={rootCloseEvent}
            >
                <ul
                    role='menu'
                    className='dropdown-menu channel-header_plugin-dropdown'
                >
                    {children}
                </ul>
            </RootCloseWrapper>
        );
    }
}

type CustomToggleProps = {
    children?: React.ReactNode;
    dropdownOpen?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    bsRole: string;
}

class CustomToggle extends React.PureComponent<CustomToggleProps> {
    handleClick = (e: React.MouseEvent) => {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    render() {
        const {children} = this.props;

        let activeClass = '';
        if (this.props.dropdownOpen) {
            activeClass = ' channel-header__icon--active';
        }

        return (
            <button
                id='pluginChannelHeaderButtonDropdown'
                className={'channel-header__icon channel-header__icon--wide ' + activeClass}
                type='button'
                onClick={this.handleClick}
            >
                {children}
            </button>
        );
    }
}

type ChannelHeaderPlugProps = {
    components: PluginComponent[];
    appBindings: AppBinding[];
    appsEnabled: boolean;
    channel: Channel;
    channelMember: ChannelMembership;
    theme: Theme;
    actions: {
        doAppCall: (call: AppCall) => Promise<ActionResult>;
    };
}

type ChannelHeaderPlugState = {
    dropdownOpen: boolean;
}

export default class ChannelHeaderPlug extends React.PureComponent<ChannelHeaderPlugProps, ChannelHeaderPlugState> {
    constructor(props: ChannelHeaderPlugProps) {
        super(props);
        this.state = {
            dropdownOpen: false,
        };
    }

    toggleDropdown = (dropdownOpen: boolean) => {
        this.setState({dropdownOpen});
    }

    onClose = () => {
        this.toggleDropdown(false);
    }

    fireActionAndClose = (action: (channel: Channel, channelMember: ChannelMembership) => void) => {
        action(this.props.channel, this.props.channelMember);
        this.onClose();
    }

    createComponentButton = (plug: PluginComponent) => {
        return (
            <HeaderIconWrapper
                key={'channelHeaderButton' + plug.id}
                buttonClass='channel-header__icon'
                iconComponent={plug.icon!}
                onClick={() => plug.action!(this.props.channel, this.props.channelMember)}
                buttonId={plug.id}
                tooltipKey={'plugin'}
                tooltipText={plug.tooltipText ? plug.tooltipText : plug.dropdownText}
            />
        );
    }

    onClick = async (binding: AppBinding) => {
        if (!binding.call) {
            return;
        }

        this.props.actions.doAppCall({
            ...binding.call,
            type: AppCallTypes.SUBMIT,
            context: {
                app_id: binding.app_id,
                location: binding.location,
                team_id: this.props.channel.team_id,
                channel_id: this.props.channel.id,
            },
        }).then((res) => {
            const callResp = (res as {data: AppCallResponse}).data;
            if (callResp?.type === AppCallResponseTypes.ERROR) {
                const errorMessage = callResp.error || 'Unknown error happenned';
                sendEphemeralPost(errorMessage, this.props.channel.id);
            }
        });
    }

    createAppBindingButton = (binding: AppBinding) => {
        return (
            <HeaderIconWrapper
                key={`channelHeaderButton_${binding.app_id}_${binding.location}`}
                buttonClass='channel-header__icon style--none'
                iconComponent={(
                    <img
                        src={binding.icon}
                        width='24'
                        height='24'
                    />
                )}
                onClick={() => this.onClick(binding)}
                buttonId={binding.location || ''}
                tooltipKey={'plugin'}
                tooltipText={binding.label}
            />
        );
    }

    createDropdown = (plugs: PluginComponent[], appBindings: AppBinding[]) => {
        const componentItems = plugs.filter((plug) => plug.action).map((plug) => {
            return (
                <li
                    key={'channelHeaderPlug' + plug.id}
                >
                    <a
                        href='#'
                        className='d-flex align-items-center'
                        onClick={() => this.fireActionAndClose(plug.action!)}
                    >
                        <span className='d-flex align-items-center overflow--ellipsis'>{plug.icon}</span>
                        <span>{plug.dropdownText}</span>
                    </a>
                </li>
            );
        });

        let items = componentItems;
        if (this.props.appsEnabled) {
            items = componentItems.concat(appBindings.filter((binding) => binding.call).map((binding) => {
                return (
                    <li
                        key={'channelHeaderPlug' + binding.app_id + binding.location}
                    >
                        <a
                            href='#'
                            className='d-flex align-items-center'
                            onClick={() => this.fireActionAndClose(() => this.props.actions.doAppCall({
                                ...binding.call,
                                url: binding?.call?.url || '',
                                type: AppCallTypes.SUBMIT,
                                context: {
                                    app_id: binding.app_id,
                                    location: binding.location,
                                    team_id: this.props.channel.team_id,
                                    channel_id: this.props.channel.id,
                                },
                            }))}
                        >
                            <span className='d-flex align-items-center overflow--ellipsis'>{(<img src={binding.icon}/>)}</span>
                            <span>{binding.label}</span>
                        </a>
                    </li>
                );
            }));
        }

        return (
            <div className='flex-child'>
                <Dropdown
                    id='channelHeaderPlugDropdown'
                    onToggle={this.toggleDropdown}
                    open={this.state.dropdownOpen}
                >
                    <CustomToggle
                        bsRole='toggle'
                        dropdownOpen={this.state.dropdownOpen}
                    >
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={this.state.dropdownOpen ? <></> : (
                                <Tooltip id='removeIcon'>
                                    <div aria-hidden={true}>
                                        <FormattedMessage
                                            id='generic_icons.plugins'
                                            defaultMessage='Plugins'
                                        />
                                    </div>
                                </Tooltip>
                            )}
                        >
                            <React.Fragment>
                                <PluginChannelHeaderIcon
                                    id='pluginChannelHeaderIcon'
                                    className='icon icon--standard icon__pluginChannelHeader'
                                    aria-hidden='true'
                                />
                                <span
                                    id='pluginCount'
                                    className='icon__text'
                                >
                                    {plugs.length}
                                </span>
                            </React.Fragment>
                        </OverlayTrigger>
                    </CustomToggle>
                    <CustomMenu
                        bsRole='menu'
                        open={this.state.dropdownOpen}
                        onClose={this.onClose}
                    >
                        {items}
                    </CustomMenu>
                </Dropdown>
            </div>
        );
    }

    render() {
        const components = this.props.components || [];
        const appBindings = this.props.appsEnabled ? this.props.appBindings || [] : [];
        if (components.length === 0 && appBindings.length === 0) {
            return null;
        } else if ((components.length + appBindings.length) <= 5) {
            let componentButtons = components.filter((plug) => plug.icon && plug.action).map(this.createComponentButton);
            if (this.props.appsEnabled) {
                componentButtons = componentButtons.concat(appBindings.map(this.createAppBindingButton));
            }
            return componentButtons;
        }

        return this.createDropdown(components, appBindings);
    }
}

/* eslint-enable react/no-multi-comp */
