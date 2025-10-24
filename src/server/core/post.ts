import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: '🏃‍♂️ 3D Runner Game',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Play Game',
      description:
        'Dodge obstacles, collect coins, and set new high scores in this thrilling 3D endless runner!',
      heading: 'Ready to Run?',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'diwali-run',
  });
};
