// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Posts change order when being sent quickly', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18698-Posts change order when being sent quickly', () => {
        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Build a message and send
                let message = '';
                for (let i = 9; i >= 0; i--) {
                    message += i + '{enter}';
                }
                cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).clear().type(message, {delay: 1});

                for (let i = 10; i > 0; i--) {
                    cy.getNthPostId(-i).then((postId) => {
                        // * Check if the text is the correct one
                        cy.get(`#postMessageText_${postId} > p`).should('have.text', String(i - 1));
                    });
                }
            });
        });
    });
});
