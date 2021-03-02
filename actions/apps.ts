// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {Action, ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {AppCallResponse, AppCall, AppForm} from 'mattermost-redux/types/apps';
import {AppCallTypes, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {openModal} from 'actions/views/modals';

import AppsForm from 'components/apps_form';

import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL, shouldOpenInNewTab} from 'utils/url';
import {browserHistory} from 'utils/browser_history';
import {makeCallErrorResponse} from 'utils/apps';
import {localizeAndFormatMessage, localizeMessage} from 'utils/utils';
import {t} from 'utils/i18n';

export function doAppCall<Res=unknown>(call: AppCall): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const res = await Client4.executeAppCall(call) as AppCallResponse<Res>;
            const responseType = res.type || AppCallResponseTypes.OK;

            switch (responseType) {
            case AppCallResponseTypes.OK:
                return {data: res};
            case AppCallResponseTypes.ERROR:
                return {data: res};
            case AppCallResponseTypes.FORM:
                if (!res.form) {
                    const errMsg = localizeMessage('apps.error.responses.form.no_form', 'Response type is `form`, but no form was included in response.');
                    return {data: makeCallErrorResponse(errMsg)};
                }

                if (call.type === AppCallTypes.SUBMIT) {
                    dispatch(openAppsModal(res.form, call));
                }

                return {data: res};
            case AppCallResponseTypes.NAVIGATE:
                if (!res.url) {
                    const errMsg = localizeMessage('apps.error.responses.navigate.no_url', 'Response type is `navigate`, but no url was included in response.');
                    return {data: makeCallErrorResponse(errMsg)};
                }

                if (call.type !== AppCallTypes.SUBMIT) {
                    const errMsg = localizeMessage('apps.error.responses.navigate.no_submit', 'Response type is `navigate`, but the call was not a submission.');
                    return {data: makeCallErrorResponse(errMsg)};
                }

                if (shouldOpenInNewTab(res.url, getSiteURL())) {
                    window.open(res.url);
                    return {data: res};
                }

                browserHistory.push(res.url);
                return {data: res};
            default: {
                const errMsg = localizeAndFormatMessage(
                    t('apps.error.responses.unknown_type'),
                    'App response type not supported. Response type: {type}.',
                    {type: responseType});
                return {data: makeCallErrorResponse(errMsg)};
            }
            }
        } catch (error) {
            const errMsg = error.message || localizeMessage('apps.error.responses.unexpected_error', 'Received an unexpected error.');
            return {data: makeCallErrorResponse(errMsg)};
        }
    };
}

export function openAppsModal(form: AppForm, call: AppCall): Action {
    return openModal({
        modalId: ModalIdentifiers.APPS_MODAL,
        dialogType: AppsForm,
        dialogProps: {
            form,
            call,
        },
    });
}
