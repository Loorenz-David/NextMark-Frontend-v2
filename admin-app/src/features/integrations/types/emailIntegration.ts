export type EmailSMTPState = {

  smtp_server: string
  smtp_port?: number

  smtp_username: string
  smtp_password: string

  use_tls?: boolean
  use_ssl?: boolean


}