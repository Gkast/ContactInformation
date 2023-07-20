import {starRating, streamToString, xmlEscape} from "../util/utility";
import {XMLParser} from "fast-xml-parser";
import * as https from "https";
import {MyHttpListener} from "../util/my-http";
import {pageHtmlResponse} from "../util/page-responses";

export function hotelDetailsPage(): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            const startTime = performance.now();
            console.log("Request Started");
            https.get(`${process.env["XML_REQUEST_URL"]}`, res => {
                console.log("Headers Received: " + (performance.now() - startTime))
                streamToString(res).then(xmlString => {
                    console.log("Body has been read: " + (performance.now() - startTime));
                    const xmlParser = new XMLParser({
                        ignoreAttributes: false,
                    });
                    const parsed = xmlParser.parse(xmlString);
                    console.log("Parse Finished: " + (performance.now() - startTime));
                    const h = parsed.HtSearchRq.Hotel;
                    const contentHtml = `
<h2>Hotel name  ${xmlEscape(h['@_Name'])}</h2>
<h3>Hotel Rating:  ${starRating(parseInt(xmlEscape(h.Official_Rating).split(" ")[0]))}</h3>
<h3>Hotel Location:  ${xmlEscape(parsed.HtSearchRq.Destination)}</h3>
<h3>Description: </h3>
<p>${xmlEscape(h.Hotel_Desc)}</p>
<div class="img-wrapper">
    ${(h.Hotel_Photos.Photo as string[]).slice(0, 5).map(url => `
    <a href="${xmlEscape(url)}" target="_blank">
        <img width="200px" src="${xmlEscape(url)}">
    </a>`).join('<br><br>')}
</div>
<h3>Facilities:</h3>
<ul>
    ${(h.Hotel_Facilities.Facility as string[]).map(facilities => `<li>${xmlEscape(facilities)}</li>`).join("")}
</ul>
`;
                    resolve(pageHtmlResponse({user: user, title: 'Hotel details for ' + parsed.HtSearchRq.HID}, contentHtml));
                })
            });
        })
}

