import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
  id: number;
  username: string;
  password?: string;
  pic?: string;
  roles?: number[] = [];
  phone?: string;
  address?: AddressModel;
  language?: string;
  timeZone?: string;
  communication?: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  first_name?: string;
  last_name?: string;
  confirmPassword?: string;
  isAgreed?: boolean;
  user_email?: string;
  candidates?: any;

  setUser(_user: unknown) {
    const user = _user as UserModel;
    this.id = user.id;
    this.username = user.username || '';
    this.password = user.password || '';
    this.pic = user.pic || './assets/media/avatars/blank.png';
    this.roles = user.roles || [];
    this.phone = user.phone || '';
    this.address = user.address;
    this.language = user.language || '';
    this.timeZone = user.timeZone || '';
    this.communication = user.communication;
    this.first_name = user.first_name || '';
    this.last_name = user.last_name || '';
    this.confirmPassword = user.confirmPassword || '';
    this.isAgreed = user.isAgreed || false;
    this.user_email = user.user_email || '';
  }
}
