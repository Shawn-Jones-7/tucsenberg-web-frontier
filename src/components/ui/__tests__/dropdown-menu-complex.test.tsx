/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../dropdown-menu';

describe('DropdownMenu - Complex Structure', () => {
  it('renders complete menu with all components', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='main-trigger'>
          Complete Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='main-content'>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem data-testid='profile-item'>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid='billing-item'>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid='settings-item'>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid='invite-trigger'>
                Invite users
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem data-testid='email-item'>
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem data-testid='message-item'>
                  Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid='more-item'>
                  More...
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem data-testid='notifications-checkbox'>
            Show notifications
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup value='bottom'>
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuRadioItem
              value='top'
              data-testid='radio-top'
            >
              Top
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='bottom'
              data-testid='radio-bottom'
            >
              Bottom
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='right'
              data-testid='radio-right'
            >
              Right
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem data-testid='logout-item'>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Verify all components are rendered
    expect(screen.getByTestId('main-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByText('My Account')).toBeInTheDocument();
    expect(screen.getByTestId('profile-item')).toBeInTheDocument();
    expect(screen.getByTestId('billing-item')).toBeInTheDocument();
    expect(screen.getByTestId('settings-item')).toBeInTheDocument();
    expect(screen.getByTestId('invite-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('radio-bottom')).toBeInTheDocument();
    expect(screen.getByTestId('logout-item')).toBeInTheDocument();

    // Verify shortcuts are rendered
    expect(screen.getByText('⇧⌘P')).toBeInTheDocument();
    expect(screen.getByText('⌘B')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘Q')).toBeInTheDocument();
  });

  it('renders deeply nested menu structure', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger data-testid='root-trigger'>
          Nested Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Level 1</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid='level-1-trigger'>
                Level 1 Sub
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Level 2</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger data-testid='level-2-trigger'>
                      Level 2 Sub
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem data-testid='deep-item'>
                        Deep Item
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByTestId('root-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('level-1-trigger')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();

    // Note: Nested sub-menu content is only rendered when parent sub-menu is opened
    // This is expected behavior for Radix UI DropdownMenu components
  });

  it('handles multiple groups with different item types', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Multi-Group Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem data-testid='action-1'>Action 1</DropdownMenuItem>
            <DropdownMenuItem data-testid='action-2'>Action 2</DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Preferences</DropdownMenuLabel>
            <DropdownMenuCheckboxItem data-testid='pref-1'>
              Preference 1
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem data-testid='pref-2'>
              Preference 2
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup value='option1'>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuRadioItem
              value='option1'
              data-testid='option-1'
            >
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='option2'
              data-testid='option-2'
            >
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Verify all groups and items are rendered
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByTestId('action-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-2')).toBeInTheDocument();

    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByTestId('pref-1')).toBeInTheDocument();
    expect(screen.getByTestId('pref-2')).toBeInTheDocument();

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByTestId('option-1')).toBeInTheDocument();
    expect(screen.getByTestId('option-2')).toBeInTheDocument();
  });

  it('renders menu with mixed content and shortcuts', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Mixed Content Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid='item-with-shortcut'>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem data-testid='item-without-shortcut'>
            Paste
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid='sub-with-shortcut'>
              More Actions
              <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem data-testid='sub-item-1'>
                Sub Action 1<DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem data-testid='sub-item-2'>
                Sub Action 2
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Verify items with and without shortcuts
    expect(screen.getByTestId('item-with-shortcut')).toBeInTheDocument();
    expect(screen.getByText('⌘C')).toBeInTheDocument();

    expect(screen.getByTestId('item-without-shortcut')).toBeInTheDocument();

    expect(screen.getByTestId('sub-with-shortcut')).toBeInTheDocument();

    // Note: Sub-menu shortcuts and content are only rendered when sub-menu is opened
    // This is expected behavior for Radix UI DropdownMenu components
  });

  it('handles empty groups and separators', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Empty Groups Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup data-testid='empty-group-1' />
          <DropdownMenuSeparator data-testid='separator-1' />
          <DropdownMenuGroup data-testid='group-with-content'>
            <DropdownMenuItem>Content Item</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator data-testid='separator-2' />
          <DropdownMenuGroup data-testid='empty-group-2' />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByTestId('empty-group-1')).toBeInTheDocument();
    expect(screen.getByTestId('separator-1')).toBeInTheDocument();
    expect(screen.getByTestId('group-with-content')).toBeInTheDocument();
    expect(screen.getByTestId('separator-2')).toBeInTheDocument();
    expect(screen.getByTestId('empty-group-2')).toBeInTheDocument();
    expect(screen.getByText('Content Item')).toBeInTheDocument();
  });
});
