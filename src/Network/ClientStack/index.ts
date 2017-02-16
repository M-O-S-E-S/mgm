import { performCall, updateToken, NetworkResponse } from './call';

import { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse } from './messages';

export { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse };

export interface Response {
    json(msg: NetworkResponse): void
}

/**
 * A utility class to locate all client urls and definitions within a single module
 */
export class ClientStack {
    /* Manually update the token from local storage to allow session resume across reloads */
    static updateToken = updateToken;

    /* Query existing session and renew JWT token */
    static resumeSession(): Promise<LoginResponse> {
        return performCall('GET', '/api/auth');
    }

    static Login(username: string, password: string): Promise<LoginResponse> {
        return performCall('POST', '/api/auth/login', { username: username, password: password });
    }

    static PasswordResetToken(email: string): Promise<void> {
        return performCall('POST', '/api/task/resetCode', { email: email });
    }
    static SetPasswordWithToken(name: string, token: string, password: string): Promise<void> {
        return performCall('POST', '/api/task/resetPassword', {
            name: name,
            token: token,
            password: password
        });
    }
    static SubmitRegistration(name: string, email: string, gender: string, password: string, summary: string): Promise<void> {
        return performCall('POST', '/api/register/submit', {
            name: name,
            email: email,
            gender: gender,
            password: password,
            summary: summary
        })
    }
}