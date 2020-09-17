// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

function addNumberOfUsersToChannel(num = 1) {
    // # Then click it to access the drop-down menu
    cy.get('#channelHeaderTitle').click();

    // * The dropdown menu of the channel header should be visible;
    cy.get('#channelLeaveChannel').should('be.visible');

    // # Click 'Add Members'
    cy.get('#channelAddMembers').click();

    // * Assert that modal appears
    // # Click the first row for a number of times
    Cypress._.times(num, () => {
        cy.get('#multiSelectList').should('be.visible').children().first().click();
    });

    // # Click the button "Add" to add user to a channel
    cy.get('#saveItems').click();

    // # Wait for the modal to disappear
    cy.get('#addUsersToChannelModal').should('not.exist');
}

function setIgnoreMentions(toSet) {
    let stringToSet = 'Off';
    if (toSet) {
        stringToSet = 'On';
    }

    // # Click on the header to open dropdown
    cy.get('#channelHeaderDropdownButton').should('exist').click();

    // # Click on the notification preferences
    cy.get('#channelNotificationPreferences').should('exist').click();

    // # Click on the edit button for ignore channel mentions
    cy.get('#ignoreChannelMentionsEdit').should('exist').click();

    // # Click on selected option
    cy.get(`#ignoreChannelMentions${stringToSet}`).should('exist').click();

    // # Click on save to save the configuration
    cy.get('#saveSetting').should('exist').click();

    // * Assert that the option selected is reflected
    cy.get('#ignoreChannelMentionsDesc').should('contain', stringToSet);

    // # Click on the X button to close the modal
    cy.get('#channelNotificationModalLabel').siblings('.close').click();
}

describe('CS15445 Join/leave messages', () => {
    let testTeam;
    let userB;

    let channelA;
    let channelB;

    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;

            // # Add 1 user
            cy.apiCreateUser().then(({user: newUser}) => {
                userB = newUser;
                cy.apiAddUserToTeam(testTeam.id, userB.id);
            });

            // # Create two channels
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then((res) => {
                channelA = res.body;
            });
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then((res) => {
                channelB = res.body;
            });

            cy.apiLogin(user);
        });
    });

    it('MM-T567 - Turn on Ignore mentions for @channel, @here and @all', () => {
        cy.visit(`/${testTeam.name}/channels/${channelA.name}`);

        // # Add users to channel
        addNumberOfUsersToChannel(1);

        cy.getLastPostId().then((id) => {
            // * The system message should contain 'added to the channel by you'
            cy.get(`#postMessageText_${id}`).should('contain', 'added to the channel by you');
        });

        // # Set ignore mentions
        setIgnoreMentions(true);

        // # Go to a different channel
        cy.visit(`/${testTeam.name}/channels/${channelB.name}`);

        // # Post messages as another user on the first channel
        cy.postMessageAs({sender: userB, message: '@all test', channelId: channelA.id});
        cy.postMessageAs({sender: userB, message: '@channel test', channelId: channelA.id});
        cy.postMessageAs({sender: userB, message: '@here test', channelId: channelA.id});

        // * Assert the channel is unread with no mentions
        cy.get(`#sidebarItem_${channelA.name}`).should('have.class', 'unread-title');
        cy.get(`#sidebarItem_${channelA.name} > #unreadMentions`).should('not.exist');
    });

    it('MM-T568 - Turn off Ignore mentions for @channel, @here and @all', () => {
        cy.visit(`/${testTeam.name}/channels/${channelA.name}`);

        // # Unset ignore mentions
        setIgnoreMentions(false);

        // # Go to a different channel
        cy.visit(`/${testTeam.name}/channels/${channelB.name}`);

        // # Post messages as another user on the first channel
        cy.postMessageAs({sender: userB, message: '@all test', channelId: channelA.id});
        cy.postMessageAs({sender: userB, message: '@channel test', channelId: channelA.id});
        cy.postMessageAs({sender: userB, message: '@here test', channelId: channelA.id});

        // * Assert the channel is unread with 3 mentions
        cy.get(`#sidebarItem_${channelA.name}`).should('have.class', 'unread-title');
        cy.get(`#sidebarItem_${channelA.name} > #unreadMentions`).should('exist').should('contain', '3');
    });
});
