// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../../fixtures/timeouts';
import users from '../../../fixtures/users.json';

let townsquareChannelId;

describe('Account Settings > General', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Store channel id for further use
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
    });

    it('AS15009 - Main Menu stays open', () => {
        // # Click the hamburger button
        cy.get('#headerInfo').find('button').click({force: true});

        // # Wait for the menu to open
        cy.wait(TIMEOUTS.TINY);

        // * Menu should be visible
        cy.get('#sidebarDropdownMenu').find('ul').should('be.visible');

        // # Post a message as other user and wait for it to reach
        cy.postMessageAs({sender: users['user-1'], message: 'abc', channelId: townsquareChannelId}).wait(TIMEOUTS.SMALL);

        // * Menu should still be visible
        cy.get('#sidebarDropdownMenu').find('ul').should('be.visible');
    });
});