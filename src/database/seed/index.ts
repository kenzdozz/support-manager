import 'dotenv/config';
import bcrypt from 'bcrypt';
import MUser, { User } from '../models/User';
import MSupportRequest from '../models/SupportRequest';

const password = bcrypt.hashSync('sec123RET', 10);
const users = [
    {
        lastName: 'Doe',
        firstName: 'John',
        email: 'john.doe@aol.com',
        password,
        role: 'user',
    },
    {
        lastName: 'Doe',
        firstName: 'Janet',
        email: 'janet.doe@aol.com',
        password,
        role: 'user',
    },
    {
        lastName: 'Pan',
        firstName: 'Peter',
        email: 'peter.pan@aol.com',
        password,
        role: 'agent',
    },
    {
        lastName: 'Pan',
        firstName: 'Paul',
        email: 'paul.pan@aol.com',
        password,
        role: 'admin',
    },
];

const seed = async () => {
    console.log('Seeding started...');
    const user1 = await MUser.create(<User>users[0]);
    const user2 = await MUser.create(<User>users[1]);
    const agent = await MUser.create(<User>users[2]);
    await MUser.create(<User>users[3]);

    const agentId = agent._id;
    const user1Id = user1._id;
    const user2Id = user2._id;
    const requests = [
        {
            subject: 'I cannot login',
            message: 'This happens with correct credentials',
            status: 'closed',
            user: user1Id,
            closedBy: agentId,
            closedAt: new Date(),
            comments: [
                {
                    message: 'Have you tried resetting your password?',
                    user: agentId,
                },
                {
                    message: 'I just did and it worked, thanks',
                    user: user1Id,
                },
                {
                    message: 'cool, have a nice day',
                    user: agentId,
                },
            ]
        },
        {
            subject: 'How do I close my account',
            message: 'I have 2 accounts, I need to close one.',
            status: 'open',
            user: user2Id,
            comments: []
        },
    ];

    await MSupportRequest.insertMany(requests);
    return 'Seeded successfully';
}

const rollback = async () => {
    console.log('Starting seed rollback...');
    const emails = users.map(a => a.email);
    const subjects = ['I cannot login', 'How do I close my account'];
    await MUser.deleteMany({ email: { $in: emails } });
    await MSupportRequest.deleteMany({ subject: { $in: subjects } });
    return 'Seeding rolled back successfully';
}

const isRollback = process.argv[2] === '--rollback';
if (isRollback) rollback().then(console.log).catch(console.log).finally(() => process.exit(0));
else seed().then(console.log).catch(console.log).finally(() => process.exit(0));
