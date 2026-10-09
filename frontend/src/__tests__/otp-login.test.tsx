import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
import OtpLogin from '../pages/otp-login';
import {request,api} from '../api/client';
vi.mock('../api/client',()=>({request:vi.fn(),api:{session:vi.fn()},setAccessToken:vi.fn()}));
const challenge={challengeId:'12345678-1234-1234-1234-123456789012',maskedMobile:'••••••9999',expiresIn:300,resendAfter:60};
beforeEach(()=>vi.clearAllMocks());afterEach(()=>{cleanup();vi.useRealTimers();});
it('sends a code then opens administration only after a verified server session',async()=>{
  const login=vi.fn();vi.mocked(request).mockResolvedValueOnce(challenge).mockResolvedValueOnce({});const session={email:'',displayName:'••••••9999',roles:['ADMIN'],mode:'review-sql'};vi.mocked(api.session).mockResolvedValue(session);
  render(<OtpLogin onLogin={login}/>);fireEvent.change(screen.getByLabelText('Mobile number'),{target:{value:'6999999999'}});fireEvent.click(screen.getByRole('button',{name:'Send sign-in code'}));
  await screen.findByLabelText('Six-digit code');expect(login).not.toHaveBeenCalled();fireEvent.change(screen.getByLabelText('Six-digit code'),{target:{value:'123456'}});fireEvent.click(screen.getByRole('button',{name:'Verify and sign in'}));await waitFor(()=>expect(login).toHaveBeenCalledWith(session));
  expect(vi.mocked(request).mock.calls[1][0]).toBe('/auth/otp/verify');
});
it('preserves the code input after failed verification and never opens the CMS',async()=>{
  const login=vi.fn();vi.mocked(request).mockResolvedValueOnce(challenge).mockRejectedValueOnce(new Error('The code is incorrect, expired or already used.'));
  render(<OtpLogin onLogin={login}/>);fireEvent.change(screen.getByLabelText('Mobile number'),{target:{value:'6999999999'}});fireEvent.click(screen.getByRole('button',{name:'Send sign-in code'}));await screen.findByLabelText('Six-digit code');fireEvent.change(screen.getByLabelText('Six-digit code'),{target:{value:'111111'}});fireEvent.click(screen.getByRole('button',{name:'Verify and sign in'}));await screen.findByRole('alert');expect(screen.getByLabelText('Six-digit code')).toHaveValue('111111');expect(login).not.toHaveBeenCalled();
});
it('shows the resend cooldown and resends only after it elapses',async()=>{
  vi.useFakeTimers();vi.mocked(request).mockResolvedValue(challenge);render(<OtpLogin onLogin={vi.fn()}/>);fireEvent.change(screen.getByLabelText('Mobile number'),{target:{value:'6999999999'}});await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Send sign-in code'})));expect(screen.getByRole('button',{name:'Resend in 60s'})).toBeDisabled();act(()=>vi.advanceTimersByTime(60000));await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Resend code'})));expect(vi.mocked(request).mock.calls[1][0]).toBe('/auth/otp/resend');expect(screen.getByRole('button',{name:'Resend in 60s'})).toBeDisabled();
});
