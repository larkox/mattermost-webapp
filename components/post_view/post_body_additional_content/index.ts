// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {Post} from 'mattermost-redux/types/posts';

import {toggleEmbedVisibility} from 'actions/post_actions';
import {isEmbedVisible} from 'selectors/posts';
import {GlobalState} from 'types/store';

import PostBodyAdditionalContent from './post_body_additional_content';

type OwnProps = {
    post: Post;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
        pluginPostWillRenderEmbedComponents: state.plugins.components.PostWillRenderEmbedComponent,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            toggleEmbedVisibility,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostBodyAdditionalContent);
