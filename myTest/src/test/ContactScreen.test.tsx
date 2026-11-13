import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { handlers, resetContact } from '../mocks/handlers.ts'
import { ContactScreen } from '../screens/ContactScreen.tsx'
import '../i18n.ts'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetContact()
})
afterAll(() => server.close())

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <ContactScreen />
    </QueryClientProvider>,
  )
}

describe('ContactScreen', () => {
  it('loads phone and email, then saves a valid email address', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(
      await screen.findByRole('button', { name: 'Contact data' }),
    )
    const originalEmail = screen.getByTestId('contact-email').textContent ?? ''
    const originalPhone = screen.getByTestId('contact-phone').textContent ?? ''
    expect(originalEmail).toContain('@')
    expect(originalPhone.length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Edit data' }))
    const emailInput = screen.getByRole('textbox', { name: 'Email' })
    const phoneInput = screen.getByRole('textbox', { name: 'Mobile phone' })
    expect(phoneInput).toBeDisabled()
    expect(phoneInput).toHaveValue(originalPhone)

    const outline = emailInput
      .closest('.MuiOutlinedInput-root')
      ?.querySelector('fieldset')
    expect(outline).not.toBeNull()
    expect(getComputedStyle(outline as Element).borderTopColor).toBe(
      'rgb(230, 179, 37)',
    )

    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid email address',
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('contact-email')).toHaveTextContent(originalEmail)

    await user.click(screen.getByRole('button', { name: 'Edit data' }))
    const nextEmail = 'updated.user@example.com'
    const nextInput = screen.getByRole('textbox', { name: 'Email' })
    await user.clear(nextInput)
    await user.type(nextInput, nextEmail)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByTestId('contact-email')).toHaveTextContent(
      nextEmail,
    )
    expect(screen.getByTestId('contact-phone')).toHaveTextContent(originalPhone)
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument()
  })
})
