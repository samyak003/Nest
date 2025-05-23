'use client'
import { useQuery } from '@apollo/client'
import {
  faMapSigns,
  faScroll,
  faUsers,
  faTools,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { addToast } from '@heroui/toast'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GET_PROJECT_DATA } from 'server/queries/projectQueries'
import { GET_LEADER_DATA } from 'server/queries/userQueries'
import { ProjectTypeGraphql } from 'types/project'
import { aboutText, roadmap, technologies } from 'utils/aboutData'
import FontAwesomeIconWrapper from 'wrappers/FontAwesomeIconWrapper'
import AnimatedCounter from 'components/AnimatedCounter'
import LoadingSpinner from 'components/LoadingSpinner'
import Markdown from 'components/MarkdownWrapper'
import SecondaryCard from 'components/SecondaryCard'
import TopContributors from 'components/TopContributors'
import UserCard from 'components/UserCard'
import { ErrorDisplay, handleAppError } from 'app/global-error'

const leaders = {
  arkid15r: 'CCSP, CISSP, CSSLP',
  kasya: 'CC',
  mamicidal: 'CISSP',
}

const About = () => {
  const [project, setProject] = useState<ProjectTypeGraphql | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const projectKey = 'nest'

  const { data, error: graphQLRequestError } = useQuery(GET_PROJECT_DATA, {
    variables: { key: projectKey },
  })

  useEffect(() => {
    if (data) {
      setProject(data?.project)
      setIsLoading(false)
    }
    if (graphQLRequestError) {
      addToast({
        description: 'Unable to complete the requested operation.',
        title: 'GraphQL Request Failed',
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        color: 'danger',
        variant: 'solid',
      })
      handleAppError(graphQLRequestError)
      setIsLoading(false)
    }
  }, [data, graphQLRequestError, projectKey])

  if (isLoading) {
    return <LoadingSpinner />
  }
  if (!project) {
    return (
      <ErrorDisplay
        statusCode={404}
        title="Data not found"
        message="Sorry, the page you're looking for doesn't exist"
      />
    )
  }

  return (
    <div className="mt-16 min-h-screen p-8 text-gray-600 dark:bg-[#212529] dark:text-gray-300">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 mt-4 text-4xl font-bold">About</h1>
        <SecondaryCard icon={faScroll} title="History">
          {aboutText.map((text) => (
            <div key={text} className="mb-4">
              <div key={text}>
                <Markdown content={text} />
              </div>
            </div>
          ))}
        </SecondaryCard>

        <SecondaryCard icon={faArrowUpRightFromSquare} title="Leaders">
          <div className="flex w-full flex-col items-center justify-around overflow-hidden md:flex-row">
            {Object.keys(leaders).map((username) => (
              <div key={username}>
                <LeaderData username={username} />
              </div>
            ))}
          </div>
        </SecondaryCard>

        {project.topContributors && (
          <TopContributors
            icon={faUsers}
            contributors={project.topContributors}
            maxInitialDisplay={9}
            type="contributor"
          />
        )}

        <SecondaryCard icon={faTools} title="Technologies & Tools">
          <div className="w-full">
            <div className="grid w-full grid-cols-1 justify-center sm:grid-cols-2 lg:grid-cols-4 lg:pl-8">
              {technologies.map((tech) => (
                <div key={tech.section} className="mb-2">
                  <h3 className="mb-3 font-semibold text-blue-400">{tech.section}</h3>
                  <ul className="space-y-3">
                    {Object.entries(tech.tools).map(([name, details]) => (
                      <li key={name} className="flex flex-row items-center gap-2">
                        <Image
                          alt={`${name} icon`}
                          className="inline-block align-middle grayscale"
                          height={24}
                          src={details.icon}
                          width={24}
                        />
                        <Link
                          href={details.url}
                          className="text-gray-600 hover:underline dark:text-gray-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </SecondaryCard>

        <SecondaryCard icon={faMapSigns} title="Roadmap">
          <ul>
            {roadmap.map((item) => (
              <li key={item.title} className="mb-4 flex flex-row items-center gap-2 pl-4 md:pl-6">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gray-600 dark:bg-gray-300"></div>
                <Link
                  href={item.issueLink}
                  target="_blank"
                  className="text-gray-600 hover:underline dark:text-gray-300"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </SecondaryCard>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: 'Forks', value: project.forksCount },
            { label: 'Stars', value: project.starsCount },
            { label: 'Contributors', value: project.contributorsCount },
            { label: 'Issues', value: project.issuesCount },
          ].map((stat, index) => (
            <div key={index}>
              <SecondaryCard className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-400">
                  <AnimatedCounter end={Math.floor(stat.value / 5) * 5} duration={2} />+
                </div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </SecondaryCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LeaderData = ({ username }: { username: string }) => {
  const { data, loading, error } = useQuery(GET_LEADER_DATA, {
    variables: { key: username },
  })

  if (loading) return <p>Loading {username}...</p>
  if (error) return <p>Error loading {username}'s data</p>

  const user = data?.user

  if (!user) {
    return <p>No data available for {username}</p>
  }

  return (
    <UserCard
      avatar={user.avatarUrl}
      button={{
        icon: <FontAwesomeIconWrapper icon="fa-solid fa-right-to-bracket" />,
        label: 'View Profile',
        onclick: () => window.open(`/members/${username}`, '_blank', 'noopener,noreferrer'),
      }}
      className="h-64 w-40 bg-inherit"
      company={user.company}
      description={leaders[user.login]}
      location={user.location}
      name={user.name || username}
    />
  )
}

export default About
