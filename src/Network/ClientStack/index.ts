import { performCall, updateToken, NetworkResponse } from './call';

import { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse } from './messages';

export { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse };

export interface Response {
    json(msg: NetworkResponse): void
}

import { Region, Estate, Host, User, Group, Role } from '../../View/Immutable';

class UserStack {
    static Create(name: string, email: string, template: string, password: string): Promise<string> {
        return performCall('POST', '/api/user/create', {
            name: name,
            email: email,
            template: template,
            password: password
        }).then((resp: NetworkResponse) => {
            return resp.Message;
        })
    }
    static SetAccessLevel(user: User, level: number): Promise<void> {
        return performCall('POST', '/api/user/accessLevel', { uuid: user.UUID, accessLevel: level });
    }
    static SetEmail(user: User, email: string): Promise<void> {
        return performCall('POST', '/api/user/email', { id: user.UUID, email: email });
    }
    static SetPassword(user: User, password: string): Promise<void> {
        return performCall('POST', '/api/user/password', { id: user.UUID, password: password });
    }
    static Destroy(user: User): Promise<void> {
        return performCall('POST', '/api/user/destroy/' + user.UUID);
    }
}

class GroupStack {
    static AddUser(group: Group, user: User, role: Role): Promise<void> {
        return performCall('POST',  '/api/group/addUser/' + group.GroupID, { user: user.UUID, role: role.RoleID });
    }
    static RemoveUser(group: Group, user: User): Promise<void> {
        return performCall('POST', '/api/group/removeUser/' + group.GroupID, { user: user.UUID })
    }
}

class RegionStack {
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
    static Destroy(region: Region): Promise<void> {
        return performCall('POST', '/api/region/destroy/' + region.uuid);
    }
    static AssignEstate(region: Region, estate: Estate): Promise<void> {
        return performCall('POST', '/api/region/estate/' + region.uuid, { estate: estate.EstateID });
    }
    static AssignHost(region: Region, host: Host): Promise<void> {
        return performCall('POST', '/api/region/host/' + region.uuid, { host: host.address });
    }
    static SetCoordinates(region: Region, x: number, y: number): Promise<void> {
        return performCall('POST', '/api/region/setXY/' + region.uuid, { x: x, y: y });
    }
}

class EstateStack {
    static Create(name: string, owner: User): Promise<number> {
        return performCall('POST', '/api/estate/create', { name: name, owner: owner.UUID });
    }
    static Destroy(estate: Estate): Promise<void> {
        return performCall('POST', '/api/estate/destroy/' + estate.EstateID)
    }
}

class HostStack {
    static Add(address: string): Promise<number> {
        return performCall('POST', '/api/host/add', { host: address }).then((resp: NetworkResponse) => {
            return parseInt(resp.Message, 10);
        });
    }
    static Destroy(host: Host): Promise<void> {
        return performCall('POST', '/api/host/remove', { host: host.address })
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

    static User = UserStack;
    static Group = GroupStack;
    static Region = RegionStack;
    static Estate = EstateStack;
    static Host = HostStack;
}