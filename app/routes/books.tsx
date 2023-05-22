import { LoaderFunction, json } from "@remix-run/node";
import { gql } from "@apollo/client";
import { graphQLClient } from "~/lib/apollo";
import { useLoaderData } from "@remix-run/react";

const query = gql`
  query GetUsers {
    users {
      email
      name
    }
  }
`;

export const loader: LoaderFunction = async ({ request, params }) => {
  const { data } = await graphQLClient.query({
    query,
  });

  return json({ users: data.users });
};

export default function Books() {
  const { users } = useLoaderData();
  return (
    <main>
      <section>
        <h1>All books</h1>
  <ul>
  {users.map(({ id, name, email }: { id: string; email: string, name: string }, index:number) => (
      <li key={index}>
        <h3>{id}</h3>
        <p>{name}</p>
        <p>{email}</p>
        </li>
    ))}
  </ul>
  </section>
  </main>
);
}
