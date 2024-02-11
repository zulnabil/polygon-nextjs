import Channel from "~/app/containers/Channel";

export default function Page({ params, searchParams }) {
  return (
    <main>
      <Channel id={params.id} pin={searchParams.pin} />
    </main>
  );
}
