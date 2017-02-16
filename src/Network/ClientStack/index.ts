import { performCall, updateToken, NetworkResponse } from './call';

import { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse } from './messages';

export { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse };

export interface Response {
    json(msg: NetworkResponse): void
}

class Region {
    static Create(name: string, x: number, y: number, estate: string): Promise<string> {
        return performCall('POST', '/api/region/create', {
            estate: estate,
            name: name,
            x: x,
            y: y
        }).then((resp: NetworkResponse) => {
            return resp.Message;
        });
    }
    static Destroy(uuid: string): Promise<void> {
        return performCall('POST', '/api/region/destroy/' + uuid);
    }
    static AssignEstate(uuid: string, estate: string): Promise<void> {
        return performCall('POST', '/api/region/estate/' + uuid, { estate: estate });
    }
    static AssignHost(uuid: string, host: string): Promise<void> {
        return performCall('POST', '/api/region/host/' + uuid, { host: host });
    }
    static SetCoordinates(uuid: string, x: number, y: number): Promise<void> {
        return performCall('POST', '/api/region/setXY/' + uuid, { x: x, y: y });
    }
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

    static Region = Region;
}