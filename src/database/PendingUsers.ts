

import * as Sequelize from 'sequelize';
import { PendingUserInstance, PendingUserAttribute } from './mysql';
import { Credential } from '../lib/Credential';

export class PendingUsers {
  private db: Sequelize.Model<PendingUserInstance, PendingUserAttribute>

  constructor(ui: Sequelize.Model<PendingUserInstance, PendingUserAttribute>) {
    this.db = ui;
  }

  getAll(): Promise<PendingUserInstance[]> {
    return this.db.findAll();
  }

  getByName(name: string): Promise<PendingUserInstance> {
    return this.db.findOne({
      where: {
        Name: name
      }
    });
  }

  create(name: string, email: string, template: string, credential: Credential, summary: string): Promise<PendingUserInstance> {
    return this.db.create({
      name: name,
      email: email,
      gender: template,
      password: credential.hash,
      summary: summary
    });
  }
}