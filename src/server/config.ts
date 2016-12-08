

export interface Config {
  mgm: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    }
    log_dir: string
    upload_dir: string
    templates: { [key: string]: string }
    voiceIP: string
    internalUrl: string
    mail: any
    tokenKey: string
  },
  halcyon: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    }
    grid_server: string
    user_server: string
    messaging_server: string
    whip: string
  },
  grid_info: {
    login: string,
    mgm: string,
    gridName: string,
    gridNick: string,
  },
  console: {
    user: string,
    pass: string
  }
}