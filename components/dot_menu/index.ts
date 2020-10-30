// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getAppsBindings} from 'mattermost-redux/selectors/entities/apps';
import AppsBindings from 'mattermost-redux/constants/apps';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {openModal} from 'actions/views/modals';
import {
    flagPost,
    unflagPost,
    pinPost,
    unpinPost,
    setEditingPost,
    markPostAsUnread,
} from 'actions/post_actions.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import {GlobalState} from 'types/store';
import {isArchivedChannel} from 'utils/channel_utils';
import {getSiteURL} from 'utils/url';
import {doAppCall} from 'actions/apps';

import DotMenu from './dot_menu';

type OwnProps = {
    post: Post;
    commentCount?: number;
    isFlagged?: boolean;
    handleCommentClick?: () => void;
    handleDropdownOpened?: () => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly?: boolean;
    enableEmojiPicker: boolean;
    location: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | 'NO_WHERE',
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const {post} = ownProps;

    const license = getLicense(state);
    const config = getConfig(state);
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, post.channel_id);
    const currentTeam = getCurrentTeam(state) || {};
    const currentTeamUrl = `${getSiteURL()}/${currentTeam.name}`;

    const appsBindings = getAppsBindings(state, AppsBindings.APPS_BINDINGS_POST_MENU_ITEM);

    return {
        channelIsArchived: isArchivedChannel(channel),
        components: state.plugins.components,
        postEditTimeLimit: getConfig(state).PostEditTimeLimit,
        isLicensed: getLicense(state).IsLicensed === 'true',
        teamId: getCurrentTeamId(state),
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
        canEdit: PostUtils.canEditPost(state, post, license, config, channel, userId),
        canDelete: PostUtils.canDeletePost(state, post, channel),
        currentTeamUrl,
        appsBindings,
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            flagPost,
            unflagPost,
            setEditingPost,
            pinPost,
            unpinPost,
            openModal,
            markPostAsUnread,
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DotMenu);
