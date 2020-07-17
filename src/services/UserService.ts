import { Profile } from '@entities/Profile';

export function getProfile(userId: string) {
  return Profile.findOne({
    where: {
      userId,
    },
  });
}
