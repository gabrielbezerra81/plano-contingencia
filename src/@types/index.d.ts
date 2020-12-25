declare module "read-xml" {
  const a = {
    readXML: (...data: any) => any,
  };

  export default a;
}

declare module "@tmcw/togeojson" {
  type KML = (...data: any) => any;

  export const kml: KML;
}
