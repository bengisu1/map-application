using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using staj.Services;

namespace staj.Controllers
{
    [Route("api/[controller]/[Action]")]//Action çağrıların hangi adresle yapılacağını değiştiriyor.
    [ApiController]
    public class CoordinateController : ControllerBase
    //ControllerBase is used when we are building APIs rather than MVC applications with views (HTML responses)
    {
        private readonly ICoordinateService coordinateService;
        //readonly, bir alanın yalnızca bir kez, tanımlandığı yerde veya sınıfın yapıcı (constructor) metodunda atanabileceğini belirtir

        public CoordinateController(ICoordinateService coordinateService)
        {
            this.coordinateService = coordinateService;
        }


        [HttpGet]
        public Response Get()
        {
            var corList =coordinateService.Get();

            return corList;

        }

        [HttpPost]
        public Response Add(CoordinateDto k)
        {
            return coordinateService.Add(k);
        }

        [HttpGet("{id}")]
        public Response GetById(Guid id)
        {
            return coordinateService.GetById(id);
        }

        [HttpPut]
        public Response Update(Guid id, CoordinateDto k)
        {
            return coordinateService.Update(id, k);
        }

        [HttpDelete]
        public Response Delete(Guid id)
        {
            return coordinateService.Delete(id);
        }
    }

}




/*using Microsoft.AspNetCore.Mvc;
using staj.Services;
using staj;

[ApiController]
[Route("api/[controller]")]
public class CoordinatesController : ControllerBase
{
    private readonly ICoordinatesService _coordinatesService;

    public CoordinatesController(ICoordinatesService coordinatesService)
    {
        _coordinatesService = coordinatesService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var response = _coordinatesService.Get();
        if (response.IsSuccess)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }

    [HttpPost]
    public IActionResult Add(Coordinate coordinate)
    {
        var response = _coordinatesService.Add(coordinate);
        if (response.IsSuccess)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var response = _coordinatesService.GetById(id);
        if (response.IsSuccess)
        {
            return Ok(response);
        }
        return NotFound(response);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Coordinate coordinate)
    {
        var response = _coordinatesService.Update(id, coordinate);
        if (response.IsSuccess)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var response = _coordinatesService.Delete(id);
        if (response.IsSuccess)
        {
            return Ok(response);
        }
        return NotFound(response);
    }
}

*/


