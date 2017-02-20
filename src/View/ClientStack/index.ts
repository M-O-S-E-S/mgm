import { performCall, updateToken, NetworkResponse } from './call';

import { LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse } from './messages';

export { NetworkResponse, LoginResponse, GetEstatesResponse, GetGroupsResponse, GetHostsResponse, GetJobsResponse, GetRegionsResponse, GetUsersResponse };

export interface Response {
    json(msg: NetworkResponse): void
}

import { IRegion, IEstate, IManager, IHost, IUser, IPendingUser, IGroup, IMember, IRole, IEstateMap, IJob } from '../../Types';
import { Region, Estate, Host, User, Group, Member, Role, Job, PendingUser } from '../Immutable';

export interface GetUsersResult {
    Users: IUser[],
    Pending: IPendingUser[]
}

class UserStack {
    static Get(): Promise<GetUsersResponse> {
        return performCall('GET', '/api/user');
    }
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

export interface GetGroupsResult {
    Groups: IGroup[],
    Members: IMember[],
    Roles: IRole[]
}

class GroupStack {
    static Get(): Promise<GetGroupsResponse> {
        return performCall('GET', '/api/group');
    }
    static AddUser(group: Group, user: User, role: Role): Promise<void> {
        return performCall('POST', '/api/group/addUser/' + group.GroupID, { user: user.UUID, role: role.RoleID });
    }
    static RemoveUser(member: Member): Promise<void> {
        return performCall('POST', '/api/group/removeUser/' + member.GroupID, { user: member.AgentID })
    }
}

class JobStack {
    static Get(): Promise<IJob[]> {
        return performCall('GET', '/api/job').then((res: GetJobsResponse) => {
            return res.Jobs;
        });
    }
    static Destroy(job: Job): Promise<void> {
        return performCall('POST', '/api/job/delete/' + job.id);
    }
    static LoadOar(region: Region): Promise<number> {
        return performCall('POST', '/api/job/loadOar/' + region.uuid).then((res: NetworkResponse) => {
            return parseInt(res.Message, 10);
        });
    }
    static Upload(job: Job, file: any): Promise<void> {
        return performCall('POST', '/api/job/upload/' + job.id, { file: file });
    }
    static SaveOar(region: Region): Promise<number> {
        return performCall('POST', '/api/job/saveOar/' + region.uuid).then((res: NetworkResponse) => {
            return parseInt(res.Message, 10);
        });
    }
    static NukeRegion(region: Region): Promise<number> {
        return performCall('POST', '/api/job/nukeContent/' + region.uuid).then((res: NetworkResponse) => {
            return parseInt(res.Message, 10);
        });
    }
}

class PendingUserStack {
    static Approve(user: PendingUser): Promise<string> {
        return performCall('POST', '/api/user/approve', { name: user.name }).then((res: NetworkResponse) => {
            return res.Message;
        })
    }
    static Deny(user: PendingUser, reason: string): Promise<string> {
        return performCall('POST', '/api/user/deny', { name: user.name, reason: reason });
    }
}

class RegionStack {
    static Get(): Promise<IRegion[]> {
        return performCall('GET', '/api/region').then((res: GetRegionsResponse) => {
            return res.Regions;
        });
    }
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
    static GetLog(region: Region): Promise<string> {
        return performCall('GET', '/api/region/logs/' + region.uuid).then((res: NetworkResponse) => {
            return res.Message;
        })
    }
    static Start(region: Region): Promise<void> {
        return performCall('POST', '/api/region/start/' + region.uuid);
    }
    static Stop(region: Region): Promise<void> {
        return performCall('POST', '/api/region/stop/' + region.uuid);
    }
    static Kill(region: Region): Promise<void> {
        return performCall('POST', '/api/region/kill/' + region.uuid);
    }
}

export interface GetEstatesResult {
    Estates: IEstate[],
    Managers: IManager[],
    EstateMap: IEstateMap[]
}

class EstateStack {
    static Get(): Promise<GetEstatesResponse> {
        return performCall('GET', '/api/estate').then((res: GetEstatesResponse) => { return res; });
    }
    static Create(name: string, owner: User): Promise<number> {
        return performCall('POST', '/api/estate/create', { name: name, owner: owner.UUID });
    }
    static Destroy(estate: Estate): Promise<void> {
        return performCall('POST', '/api/estate/destroy/' + estate.EstateID)
    }
}

class HostStack {
    static Get(): Promise<IHost[]> {
        return performCall('GET', '/api/host').then((res: GetHostsResponse) => { return res.Hosts; });
    }
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
    static Job = JobStack;
    static PendingUser = PendingUserStack;
    static Group = GroupStack;
    static Region = RegionStack;
    static Estate = EstateStack;
    static Host = HostStack;
}