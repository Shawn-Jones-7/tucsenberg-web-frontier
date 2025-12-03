/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion';

describe('Accordion - Basic Rendering & Interaction', () => {
  it('renders trigger and content', () => {
    render(
      <Accordion
        type='single'
        collapsible
      >
        <AccordionItem value='item-1'>
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(
      screen.getByRole('button', { name: 'Question 1' }),
    ).toBeInTheDocument();
    // Content exists in the DOM but is hidden by default
    expect(screen.getByRole('region', { hidden: true })).toBeInTheDocument();
  });

  it('toggles aria-expanded when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Accordion
        type='single'
        collapsible
      >
        <AccordionItem value='item-1'>
          <AccordionTrigger>Question 2</AccordionTrigger>
          <AccordionContent>Answer 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Question 2' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies data-slot attributes for theming', () => {
    render(
      <Accordion
        type='single'
        collapsible
      >
        <AccordionItem value='item-1'>
          <AccordionTrigger>Slot Test</AccordionTrigger>
          <AccordionContent>Slot Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const root = screen
      .getByRole('button', { name: 'Slot Test' })
      .closest("[data-slot='accordion']");
    expect(root).not.toBeNull();
  });
});
