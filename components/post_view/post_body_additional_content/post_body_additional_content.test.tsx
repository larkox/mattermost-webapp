// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import * as postUtils from 'mattermost-redux/utils/post_utils';
import {Post, PostEmbed, PostImage as PostImageType} from 'mattermost-redux/types/posts';
import {Dictionary} from 'mattermost-redux/types/utilities';

import MessageAttachmentList from 'components/post_view/message_attachments/message_attachment_list';
import PostAttachmentOpenGraph from 'components/post_view/post_attachment_opengraph';
import PostImage from 'components/post_view/post_image';
import YoutubeVideo from 'components/youtube_video';
import {PluginComponent} from 'types/store/plugins';

import PostBodyAdditionalContent from './post_body_additional_content';

describe('PostBodyAdditionalContent', () => {
    const baseProps = {
        children: <span>{'some children'}</span>,
        post: {
            id: 'post_id_1',
            root_id: 'root_id',
            channel_id: 'channel_id',
            create_at: 1,
            message: '',
            metadata: {},
        } as Post,
        isEmbedVisible: true,
        actions: {
            toggleEmbedVisibility: jest.fn(),
        },
    };

    describe('with an image preview', () => {
        const imageUrl = 'https://example.com/image.png';
        const imageMetadata = {} as PostImageType; // This can be empty since we're checking equality with ===

        const imageBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: imageUrl,
                metadata: {
                    embeds: [{
                        type: 'image',
                        url: imageUrl,
                    }],
                    images: {
                        [imageUrl]: imageMetadata,
                    } as Dictionary<PostImageType>,
                },
            } as Post,
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...imageBaseProps}/>);

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(PostImage).exists()).toBe(true);
            expect(wrapper.find(PostImage).prop('imageMetadata')).toBe(imageMetadata);
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...imageBaseProps,
                post: {
                    ...imageBaseProps.post,
                    message: 'This is an image: ' + imageUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should not render content when isEmbedVisible is false', () => {
            const props = {
                ...imageBaseProps,
                isEmbedVisible: false,
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper.find(PostImage).exists()).toBe(false);
        });
    });

    describe('with a message attachment', () => {
        const attachments: any = []; // This can be empty since we're checking equality with ===
        // TODO use proper attachments type

        const messageAttachmentBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                metadata: {
                    embeds: [{
                        type: 'message_attachment',
                    }],
                },
                props: {
                    attachments,
                } as Record<string, any>,
            } as Post,
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...messageAttachmentBaseProps}/>);

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(MessageAttachmentList).exists()).toBe(true);
            expect(wrapper.find(MessageAttachmentList).prop('attachments')).toBe(attachments);
        });

        test('should render content when isEmbedVisible is false', () => {
            const props = {
                ...messageAttachmentBaseProps,
                isEmbedVisible: false,
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper.find(MessageAttachmentList).exists()).toBe(true);
        });
    });

    describe('with an opengraph preview', () => {
        const ogUrl = 'https://example.com/image.png';

        const ogBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: ogUrl,
                metadata: {
                    embeds: [{
                        type: 'opengraph',
                        url: ogUrl,
                    }],
                },
            } as Post,
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...ogBaseProps}/>);

            expect(wrapper.find(PostAttachmentOpenGraph).exists()).toBe(true);
            expect(wrapper).toMatchSnapshot();
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...ogBaseProps,
                post: {
                    ...ogBaseProps.post,
                    message: 'This is a link: ' + ogUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should render content when isEmbedVisible is false', () => {
            const props = {
                ...ogBaseProps,
                isEmbedVisible: false,
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper.find(PostAttachmentOpenGraph).exists()).toBe(true);
        });
    });

    describe('with a YouTube video', () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=d-YO3v-wJts';

        const youtubeBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: youtubeUrl,
                metadata: {
                    embeds: [{
                        type: 'opengraph',
                        url: youtubeUrl,
                    }],
                },
            } as Post,
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...youtubeBaseProps}/>);

            expect(wrapper.find(YoutubeVideo).exists()).toBe(true);
            expect(wrapper).toMatchSnapshot();
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...youtubeBaseProps,
                post: {
                    ...youtubeBaseProps.post,
                    message: 'This is a video: ' + youtubeUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should not render content when isEmbedVisible is false', () => {
            const props = {
                ...youtubeBaseProps,
                isEmbedVisible: false,
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper.find(YoutubeVideo).exists()).toBe(false);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('with a normal link', () => {
        const mp3Url = 'https://example.com/song.mp3';

        const EmbedMP3: React.FC<{embed: React.ReactElement}> = ({embed}) => (embed);

        const linkBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: mp3Url,
                metadata: {
                    embeds: [{
                        type: 'link',
                        url: mp3Url,
                    }],
                },
            } as Post,
        };

        test("Should render nothing if the registered plugins don't match", () => {
            const props = {
                ...linkBaseProps,
                pluginPostWillRenderEmbedComponents: [
                    {
                        match: (() => false) as (embed: PostEmbed) => boolean,
                        toggleable: true,
                        component: EmbedMP3,
                    } as PluginComponent,
                ] as PluginComponent[],
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
            expect(wrapper.find(EmbedMP3).exists()).toBe(false);
            expect(wrapper).toMatchSnapshot();
        });

        test('Should render the plugin component if it matches and is toggeable', () => {
            const props = {
                ...linkBaseProps,
                pluginPostWillRenderEmbedComponents: [
                    {
                        match: ({url}: PostEmbed) => url === mp3Url,
                        toggleable: true,
                        component: EmbedMP3,
                    } as PluginComponent,
                ],
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
            expect(wrapper.find(EmbedMP3).exists()).toBe(true);
            expect(wrapper.find('button.post__embed-visibility').exists()).toBe(true);
            expect(wrapper).toMatchSnapshot();
        });

        test('Should render the plugin component if it matches and is not toggeable', () => {
            const props = {
                ...linkBaseProps,
                pluginPostWillRenderEmbedComponents: [
                    {
                        match: ({url}: PostEmbed) => url === mp3Url,
                        toggleable: false,
                        component: EmbedMP3,
                    } as PluginComponent,
                ],
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
            expect(wrapper.find(EmbedMP3).exists()).toBe(true);
            expect(wrapper.find('button.post__embed-visibility').exists()).toBe(false);
            expect(wrapper).toMatchSnapshot();
        });

        test('Should render nothing if the plugin matches but isEmbedVisible is false', () => {
            const props = {
                ...linkBaseProps,
                pluginPostWillRenderEmbedComponents: [
                    {
                        match: ({url}: PostEmbed) => url === mp3Url,
                        toggleable: false,
                        component: EmbedMP3,
                    } as PluginComponent,
                ],
                isEmbedVisible: false,
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
            expect(wrapper.find(EmbedMP3).exists()).toBe(false);
            expect(wrapper).toMatchSnapshot();
        });
    });

    test('should call toggleEmbedVisibility with post id', () => {
        const wrapper = shallow(<PostBodyAdditionalContent {...baseProps}/>);

        (wrapper.instance() as PostBodyAdditionalContent).toggleEmbedVisibility();

        expect(baseProps.actions.toggleEmbedVisibility).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.toggleEmbedVisibility).toBeCalledWith('post_id_1');
    });

    test('should call getEmbedFromMetadata with metadata', () => {
        const metadata = {
            embeds: [{
                type: 'message_attachment',
            }],
        };
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                metadata,
            } as Post,
        };

        const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
        Object.defineProperty(postUtils, 'getEmbedFromMetadata', {value: jest.fn().mockReturnValue({})});
        (wrapper.instance() as PostBodyAdditionalContent).getEmbed();

        expect(postUtils.getEmbedFromMetadata).toHaveBeenCalledWith(metadata);
    });
});
