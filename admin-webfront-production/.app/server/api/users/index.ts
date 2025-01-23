export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const data = await getDemoData()

  return {
    total: data.length,
    data: filterDemoData(data, filter, page, perPage),
  }
})

function filterDemoData(
  data: any[],
  filter: string,
  page: number,
  perPage: number,
) {
  const offset = (page - 1) * perPage
  if (!filter) {
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.username, item.location, item.position, item.industry].some(
        (item) => item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function getDemoData() {
  return Promise.resolve([
    {
      id: 0,
      fullName: 'Sangeethan',
      userRole: 'Admin',
      src: '/img/avatars/3.svg',
      email: 'sangeethan@elephantcrew.global',
      designation: 'Developer',
      status: 'Active',
      lastLogin: '3 hour',
      dateCreated: '20 January 2024',
      school: 'School 1',
    },
    {
      id: 1,
      fullName: 'John Doe',
      userRole: 'User',
      src: '/img/avatars/1.svg',
      email: 'john.doe@example.com',
      designation: 'Designer',
      status: 'Inactive',
      lastLogin: 'Never',
      dateCreated: '28 February 2024',
      school: 'School 2',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      userRole: 'User',
      src: '/img/avatars/2.svg',
      email: 'jane.smith@example.com',
      designation: 'Analyst',
      status: 'Draft',
      lastLogin: 'Yesterday',
      dateCreated: '28 February 2024',
      school: 'School 3',
    },
    {
      id: 3,
      fullName: 'Bob Johnson',
      userRole: 'User',
      src: '/img/avatars/1.svg',
      email: 'bob.johnson@example.com',
      designation: 'Manager',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 4',
    },
    {
      id: 4,
      fullName: 'Alice Williams',
      userRole: 'User',
      src: '/img/avatars/4.svg',
      email: 'alice.williams@example.com',
      designation: 'Developer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 5',
    },
    {
      id: 5,
      fullName: 'Charlie Brown',
      userRole: 'User',
      src: '/img/avatars/5.svg',
      email: 'charlie.brown@example.com',
      designation: 'Designer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 6,
      fullName: 'Eva Davis',
      userRole: 'User',
      src: '/img/avatars/6.svg',
      email: 'eva.davis@example.com',
      designation: 'Analyst',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 7,
      fullName: 'Frank Wilson',
      userRole: 'User',
      src: '/img/avatars/7.svg',
      email: 'frank.wilson@example.com',
      designation: 'Manager',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 8,
      fullName: 'Grace Miller',
      userRole: 'User',
      src: '/img/avatars/8.svg',
      email: 'grace.miller@example.com',
      designation: 'Developer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 9,
      fullName: 'Henry Taylor',
      userRole: 'User',
      src: '/img/avatars/9.svg',
      email: 'henry.taylor@example.com',
      designation: 'Designer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 10,
      fullName: 'Grace Miller',
      userRole: 'User',
      src: '/img/avatars/8.svg',
      email: 'grace.miller@example.com',
      designation: 'Developer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
    {
      id: 11,
      fullName: 'Henry Taylor',
      userRole: 'User',
      src: '/img/avatars/9.svg',
      email: 'henry.taylor@example.com',
      designation: 'Designer',
      status: 'Active',
      lastLogin: '20 January 2024',
      dateCreated: '28 February 2024',
      school: 'School 1',
    },
  ])
}
