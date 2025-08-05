export const useActiveRoute = () => {
  const isActive = (path: string) => {
    const route = useRoute();
    return path === "/" ? route.path === "/" : route.path.startsWith(path);
  };
  return { isActive };
};
